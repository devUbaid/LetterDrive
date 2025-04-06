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

  // Fix text direction issue immediately when component mounts
  useEffect(() => {
    // Force direction on parent elements
    document.documentElement.setAttribute('dir', 'ltr');
    document.body.setAttribute('dir', 'ltr');
    
    // Apply a CSS override for the specific editor
    const style = document.createElement('style');
    style.innerHTML = `
      .letter-content-editable, 
      .letter-content-editable * {
        direction: ltr !important;
        text-align: left !important;
        unicode-bidi: plaintext !important;
      }
      
      /* Ensure cursor is at the correct side */
      .letter-content-editable {
        caret-color: black;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (id) fetchLetter();
    else setCursorToEnd();
  }, [id]);

  // Monitor and fix text direction on content changes
  useEffect(() => {
    if (contentRef.current) {
      const applyLtrToAllElements = (element) => {
        element.style.direction = 'ltr';
        element.style.textAlign = 'left';
        element.setAttribute('dir', 'ltr');
        
        // Apply to all child elements
        Array.from(element.children).forEach(child => {
          applyLtrToAllElements(child);
        });
      };
      
      applyLtrToAllElements(contentRef.current);
    }
  }, [letter.content]);

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
    setLetter(prev => ({ ...prev, [name]: value }));

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveLetter();
    }, 1000);
  };

  // Handle content input with special direction handling
  const handleContentInput = (e) => {
    const value = e.currentTarget.innerHTML;
    
    // Store the selection position
    saveSelection();
    
    // Update the state with the new content
    setLetter(prev => ({ ...prev, content: value }));
    
    // Apply direction fixes to all elements
    e.currentTarget.style.direction = 'ltr';
    e.currentTarget.style.textAlign = 'left';
    Array.from(e.currentTarget.children).forEach(child => {
      child.style.direction = 'ltr';
      child.style.textAlign = 'left';
      child.setAttribute('dir', 'ltr');
    });
    
    // Restore selection
    restoreSelection();
    
    // Update toolbar state
    updateToolbarState();
    
    // Schedule auto-save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveLetter();
    }, 1000);
  };

  const saveLetter = async () => {
    setSaving(true);
    setSaveStatus('Saving...');
    try {
      const url = id ? `${API_BASE_URL}/api/letters/${id}` : `${API_BASE_URL}/api/letters`;
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
    
    // Fix direction on any newly created elements from formatting
    if (contentRef.current) {
      Array.from(contentRef.current.querySelectorAll('*')).forEach(el => {
        el.style.direction = 'ltr';
        el.style.textAlign = 'left';
        el.setAttribute('dir', 'ltr');
      });
    }
    
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
    
    // Remove any existing size classes from the selection
    document.execCommand('removeFormat', false, null);
    
    // Create a span with the new size class
    const span = document.createElement('span');
    span.className = size;
    span.dir = "ltr"; 
    span.style.direction = "ltr";
    span.style.textAlign = "left";
    
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
    
    // Force LTR on content after typing
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.style.direction = 'ltr';
        contentRef.current.style.textAlign = 'left';
      }
    }, 0);
  };

  // Special handler for manual text input to ensure proper direction
  const handleManualInput = (e) => {
    // Only process if this is a direct text input event
    if (e.inputType === 'insertText' && contentRef.current) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Create a text wrapper with proper direction
        const textWrapper = document.createElement('span');
        textWrapper.style.direction = 'ltr';
        textWrapper.style.textAlign = 'left';
        textWrapper.setAttribute('dir', 'ltr');
        
        // Wrap the current selection
        if (!range.collapsed) {
          textWrapper.textContent = e.data || '';
          range.deleteContents();
          range.insertNode(textWrapper);
          
          // Move cursor after inserted text
          range.setStartAfter(textWrapper);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          
          // Update state
          setLetter(prev => ({
            ...prev,
            content: contentRef.current.innerHTML
          }));
          
          e.preventDefault();
        }
      }
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
    <div className="editor-container" dir="ltr" style={{direction: "ltr"}}>
      <div className="editor-header">
        <input
          type="text"
          name="title"
          value={letter.title}
          onChange={handleChange}
          placeholder="Untitled Letter"
          className="letter-title-input"
          dir="ltr"
          style={{direction: "ltr", textAlign: "left"}}
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
          <option value="text-small">Small</option>
          <option value="text-normal">Normal</option>
          <option value="text-large">Large</option>
          <option value="text-xlarge">Extra Large</option>
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
        <bdi
          ref={contentRef}
          className="letter-content-editable"
          contentEditable="true"
          suppressContentEditableWarning
          dir="ltr"
          style={{
            direction: "ltr", 
            textAlign: "left", 
            unicodeBidi: "plaintext"
          }}
          onInput={handleContentInput}
          onBeforeInput={handleManualInput}
          onKeyDown={handleKeyDown}
          onKeyUp={updateToolbarState}
          onMouseUp={updateToolbarState}
          onBlur={saveSelection}
          onFocus={() => {
            if (!letter.content) {
              setCursorToEnd();
            }
            updateToolbarState();
          }}
          dangerouslySetInnerHTML={{ __html: letter.content }}
        ></bdi>
      </div>
    </div>
  );
}

export default Editor;