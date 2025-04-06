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

  useEffect(() => {
    if (id) fetchLetter();
    else setCursorToEnd();
  }, [id]);

  // Set cursor to end of content when needed
  const setCursorToEnd = () => {
    setTimeout(() => {
      if (contentRef.current) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(contentRef.current);
        range.collapse(false); // false means collapse to end
        selection.removeAllRanges();
        selection.addRange(range);
        contentRef.current.focus();
      }
    }, 0);
  };

  // Save selection state
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      selectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  // Restore previously saved selection
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
      const response = await fetch(`http://localhost:5000/api/letters/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setLetter(data);
        setCursorToEnd();
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      navigate('/dashboard');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLetter((prev) => ({ ...prev, [name]: value }));

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveLetter();
    }, 1000);
  };

  const saveLetter = async () => {
    setSaving(true);
    setSaveStatus('Saving...');
    try {
      const url = id ? `http://localhost:5000/api/letters/${id}` : 'http://localhost:5000/api/letters';
      const method = id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(letter),
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
      const response = await fetch(`http://localhost:5000/api/drive/save/${id || letter._id}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setLetter((prev) => ({ ...prev, savedToDrive: true, driveFileId: data.fileId }));
        setSaveStatus('Saved to Google Drive');
        setTimeout(() => setSaveStatus(''), 2000);
      } else setSaveStatus('Failed to save to Drive');
    } catch (error) {
      setSaveStatus('Failed to save to Drive');
    } finally {
      setSavingToDrive(false);
    }
  };

  // Improved formatting handler that maintains multiple formats
  const handleFormatting = (format) => {
    // Save the current selection
    saveSelection();
    
    // Apply the formatting command
    document.execCommand(format, false, null);
    
    // Update the toolbar state to show which formats are active
    updateToolbarState();
    
    // Make sure the content element stays focused
    contentRef.current.focus();
  };

  const handleFontChange = (font) => {
    saveSelection();
    document.execCommand('fontName', false, font);
    setActiveFont(font);
    restoreSelection();
  };

  const handleSizeChange = (size) => {
    const selection = window.getSelection();
    saveSelection();
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      if (!range.collapsed) {
        const span = document.createElement('span');
        span.className = size;
        range.surroundContents(span);
      } else {
        const span = document.createElement('span');
        span.className = size;
        span.innerHTML = '&#8203;'; // Zero-width space
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
    // Handle special keys as needed
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&emsp;');
    }
  };

  const downloadAsTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([letter.content.replace(/<[^>]*>/g, '')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${letter.title || 'Untitled'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(letter.content.replace(/<[^>]*>/g, ''), 10, 10);
    doc.save(`${letter.title || 'Untitled'}.pdf`);
  };

  const characterCount = letter.content.replace(/<[^>]*>/g, '').length;
  const wordCount = letter.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length || 0;
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
          <button className="save-btn" onClick={saveLetter} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          <button className="save-drive-btn" onClick={saveLetterToDrive} disabled={savingToDrive}>{savingToDrive ? 'Saving to Drive...' : 'Save to Google Drive'}</button>
          <button onClick={downloadAsTxt}>Download TXT</button>
          <button onClick={exportToPDF}>Export to PDF</button>
        </div>
      </div>

      <div className="formatting-toolbar">
        <select 
          value={activeFont}
          onChange={(e) => handleFontChange(e.target.value)}
          aria-label="Font family"
        >
          <option value="font-arial">Arial</option>
          <option value="font-times">Times New Roman</option>
          <option value="font-courier">Courier New</option>
          <option value="font-georgia">Georgia</option>
          <option value="font-verdana">Verdana</option>
        </select>

        <select 
          value={activeSize}
          onChange={(e) => handleSizeChange(e.target.value)}
          aria-label="Font size"
        >
          <option className='option' value="text-small">Small</option>
          <option className='option' value="text-normal">Normal</option>
          <option className='option' value="text-large">Large</option>
          <option className='option' value="text-xlarge">Extra Large</option>
        </select>

        <button 
          onClick={() => handleFormatting('bold')} 
          className={activeFormats.bold ? 'active' : ''} 
          aria-label="Bold"
        >
          <b>B</b>
        </button>
        <button 
          onClick={() => handleFormatting('italic')} 
          className={activeFormats.italic ? 'active' : ''} 
          aria-label="Italic"
        >
          <i>I</i>
        </button>
        <button 
          onClick={() => handleFormatting('underline')} 
          className={activeFormats.underline ? 'active' : ''} 
          aria-label="Underline"
        >
          <u>U</u>
        </button>
        <button onClick={() => handleFormatting('insertUnorderedList')} aria-label="Bullet list">
          • List
        </button>
        <button onClick={() => handleFormatting('insertOrderedList')} aria-label="Numbered list">
          1. List
        </button>
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
          onInput={(e) => {
            handleChange({ target: { name: 'content', value: e.currentTarget.innerHTML } });
            updateToolbarState();
          }}
          onKeyDown={handleKeyDown}
          onKeyUp={updateToolbarState}
          onMouseUp={updateToolbarState}
          onBlur={saveSelection}
          onFocus={() => {
            // Only set cursor to end when initially focused and empty
            if (!letter.content) {
              setCursorToEnd();
            }
            updateToolbarState();
          }}
          dangerouslySetInnerHTML={{ __html: letter.content }}
        ></div>
      </div>
    </div>
  );
}

export default Editor;