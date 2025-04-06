import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Editor.css';
import { jsPDF } from 'jspdf';

function Editor({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [letter, setLetter] = useState({
    title: '',
    content: '',
    savedToDrive: false,
  });
  const [saving, setSaving] = useState(false);
  const [savingToDrive, setSavingToDrive] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false
  });
  const [activeFont, setActiveFont] = useState('font-arial');
  const [activeSize, setActiveSize] = useState('text-normal');
  const saveTimeoutRef = useRef(null);
  const contentRef = useRef(null);
  const selectionRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (id) fetchLetter();
    else {
      if (contentRef.current) contentRef.current.innerHTML = '';
      setCursorToEnd();
    }
  }, [id]);

  const setCursorToEnd = () => {
    setTimeout(() => {
      if (contentRef.current) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(contentRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        contentRef.current.focus();
      }
    }, 0);
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      selectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (selectionRef.current && contentRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(selectionRef.current);
      contentRef.current.focus();
    }
  };

  const fetchLetter = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/letters/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setLetter(data);

        // Manually set content in editable div
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.innerHTML = data.content || '';
          }
          setCursorToEnd();
        }, 0);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      navigate('/dashboard');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLetter(prev => ({ ...prev, [name]: value }));

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveLetter();
    }, 1000);
  };

  const saveLetter = async () => {
    setSaving(true);
    setSaveStatus('Saving...');
    try {
      const updatedLetter = {
        ...letter,
        content: contentRef.current?.innerHTML || '',
      };
      const url = id ? `${API_BASE_URL}/api/letters/${id}` : `${API_BASE_URL}/api/letters`;
      const method = id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedLetter),
      });
      if (response.ok) {
        const data = await response.json();
        if (!id) navigate(`/editor/${data._id}`, { replace: true });
        setSaveStatus('Saved');
        setTimeout(() => setSaveStatus(''), 2000);
      } else setSaveStatus('Failed to save');
    } catch (error) {
      setSaveStatus('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const saveLetterToDrive = async () => {
    if (!id) await saveLetter();
    setSavingToDrive(true);
    setSaveStatus('Saving to Google Drive...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/drive/save/${id || letter._id}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setLetter(prev => ({ ...prev, savedToDrive: true, driveFileId: data.fileId }));
        setSaveStatus('Saved to Google Drive');
        setTimeout(() => setSaveStatus(''), 2000);
      } else setSaveStatus('Failed to save to Drive');
    } catch (error) {
      setSaveStatus('Failed to save to Drive');
    } finally {
      setSavingToDrive(false);
    }
  };

  const handleFormatting = (format) => {
    saveSelection();
    document.execCommand(format, false, null);
    updateToolbarState();
    contentRef.current.focus();
  };

  const handleFontChange = (font) => {
    saveSelection();
    document.execCommand('fontName', false, font);
    setActiveFont(font);
    restoreSelection();
  };

  const handleSizeChange = (size) => {
    saveSelection();
    document.execCommand('removeFormat', false, null);
    const span = document.createElement('span');
    span.className = size;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        range.surroundContents(span);
      } else {
        span.innerHTML = '&#8203;';
        range.insertNode(span);
        const newRange = document.createRange();
        newRange.setStart(span, 1);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }

    setActiveSize(size);
    contentRef.current.focus();
  };

  const updateToolbarState = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&emsp;');
    }
  };

  const downloadAsTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([contentRef.current.innerText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${letter.title || 'Untitled'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(contentRef.current.innerText, 10, 10);
    doc.save(`${letter.title || 'Untitled'}.pdf`);
  };

  const plainText = contentRef.current?.innerText || '';
  const characterCount = plainText.length;
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  const wordLimit = 500;

  return (
    <div className="editor-container">
      <div className="editor-header">
        <input
          type="text"
          name="title"
          value={letter.title}
          onChange={handleChange}
          placeholder="Untitled Letter"
          className="letter-title-input"
        />
        <div className="editor-actions">
          <span className="save-status">{saveStatus}</span>
          <button className="save-btn" onClick={saveLetter} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button className="save-drive-btn" onClick={saveLetterToDrive} disabled={savingToDrive}>
            {savingToDrive ? 'Saving to Drive...' : 'Save to Google Drive'}
          </button>
          <button onClick={downloadAsTxt}>Download TXT</button>
          <button onClick={exportToPDF}>Export to PDF</button>
        </div>
      </div>

      <div className="formatting-toolbar">
        <select value={activeFont} onChange={(e) => handleFontChange(e.target.value)}>
          <option value="font-arial">Arial</option>
          <option value="font-times">Times New Roman</option>
          <option value="font-courier">Courier New</option>
          <option value="font-georgia">Georgia</option>
          <option value="font-verdana">Verdana</option>
        </select>

        <select value={activeSize} onChange={(e) => handleSizeChange(e.target.value)}>
          <option value="text-small">Small</option>
          <option value="text-normal">Normal</option>
          <option value="text-large">Large</option>
          <option value="text-xlarge">Extra Large</option>
        </select>

        <button onClick={() => handleFormatting('bold')} className={activeFormats.bold ? 'active' : ''}>
          <b>B</b>
        </button>
        <button onClick={() => handleFormatting('italic')} className={activeFormats.italic ? 'active' : ''}>
          <i>I</i>
        </button>
        <button onClick={() => handleFormatting('underline')} className={activeFormats.underline ? 'active' : ''}>
          <u>U</u>
        </button>
        <button onClick={() => handleFormatting('insertUnorderedList')}>• List</button>
        <button onClick={() => handleFormatting('insertOrderedList')}>1. List</button>
      </div>

      <div className="word-count-status">
        {wordCount} words / {characterCount} characters (Limit: {wordLimit} words)
      </div>

      <div className="editor-content">
        <div
          ref={contentRef}
          className="letter-content-editable"
          contentEditable="true"
          suppressContentEditableWarning
          onInput={() => {
            setLetter((prev) => ({ ...prev, content: contentRef.current.innerHTML }));
            updateToolbarState();
          }}
          onKeyDown={handleKeyDown}
          onKeyUp={updateToolbarState}
          onMouseUp={updateToolbarState}
          onBlur={saveSelection}
          onFocus={() => {
            if (!letter.content) setCursorToEnd();
            updateToolbarState();
          }}
        ></div>
      </div>
    </div>
  );
}

export default Editor;
