import React, { useState, useEffect } from 'react'

function OverlayEditor({ selectedOverlay, onCreateOverlay, onUpdateOverlay, onDeleteOverlay, onSelectOverlay, loading }) {
  const [formData, setFormData] = useState({
    type: 'text',
    content: '',
    style: {
      fontSize: 18,
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      fontFamily: 'Arial',
      fontWeight: 'normal'
    },
    position: { x: 50, y: 50 },
    size: { width: 200, height: 50 },
    zIndex: 10
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (selectedOverlay) {
      setFormData({
        type: selectedOverlay.type,
        content: selectedOverlay.content,
        style: selectedOverlay.style || {
          fontSize: 18,
          color: '#ffffff',
          backgroundColor: 'rgba(0,0,0,0.7)',
          fontFamily: 'Arial',
          fontWeight: 'normal'
        },
        position: selectedOverlay.position,
        size: selectedOverlay.size,
        zIndex: selectedOverlay.zIndex || 10
      })
    }
  }, [selectedOverlay])

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.content.trim()) {
      alert('Please enter content for the overlay')
      return
    }

    setIsSubmitting(true)
    try {
      if (selectedOverlay) {
        await onUpdateOverlay(selectedOverlay._id, formData)
      } else {
        await onCreateOverlay(formData)
        // Reset form after creating
        setFormData({
          type: 'text',
          content: '',
          style: {
            fontSize: 18,
            color: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            fontFamily: 'Arial',
            fontWeight: 'normal'
          },
          position: { x: 50, y: 50 },
          size: { width: 200, height: 50 },
          zIndex: 10
        })
      }
    } catch (error) {
      alert('Failed to save overlay')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (selectedOverlay && confirm('Are you sure you want to delete this overlay?')) {
      await onDeleteOverlay(selectedOverlay._id)
      onSelectOverlay(null)
    }
  }

  const handleClear = () => {
    onSelectOverlay(null)
    setFormData({
      type: 'text',
      content: '',
      style: {
        fontSize: 18,
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.7)',
        fontFamily: 'Arial',
        fontWeight: 'normal'
      },
      position: { x: 50, y: 50 },
      size: { width: 200, height: 50 },
      zIndex: 10
    })
  }

  const presetTemplates = [
    { name: 'Live Badge', type: 'text', content: 'LIVE', style: { fontSize: 20, color: '#ffffff', backgroundColor: 'rgba(239, 68, 68, 0.9)', fontWeight: 'bold' } },
    { name: 'Breaking News', type: 'text', content: 'BREAKING NEWS', style: { fontSize: 16, color: '#ffffff', backgroundColor: 'rgba(239, 68, 68, 0.9)', fontWeight: 'bold' } },
    { name: 'Watermark', type: 'text', content: 'Your Logo', style: { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)', backgroundColor: 'transparent', fontWeight: 'normal' } }
  ]

  const applyTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      type: template.type,
      content: template.content,
      style: { ...prev.style, ...template.style }
    }))
  }

  return (
    <div>
      {/* Quick Templates */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#e2e8f0' }}>
          📋 Quick Templates
        </h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {presetTemplates.map((template, index) => (
            <button
              key={index}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
              onClick={() => applyTemplate(template)}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-group">
          <label>Overlay Type</label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
          >
            <option value="text">📝 Text Overlay</option>
            <option value="image">🖼️ Image Overlay</option>
          </select>
        </div>

        <div className="form-group">
          <label>{formData.type === 'text' ? 'Text Content' : 'Image URL'}</label>
          <input
            type="text"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder={formData.type === 'text' ? 'Enter your text...' : 'https://example.com/image.png'}
            required
          />
        </div>

        {formData.type === 'text' && (
          <>
            <div className="form-group">
              <label>Font Size</label>
              <input
                type="range"
                min="10"
                max="72"
                value={formData.style.fontSize}
                onChange={(e) => handleInputChange('style.fontSize', parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#a0a0a0', marginTop: '4px' }}>
                {formData.style.fontSize}px
              </div>
            </div>

            <div className="form-group">
              <label>Text Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={formData.style.color}
                  onChange={(e) => handleInputChange('style.color', e.target.value)}
                  style={{ width: '50px', height: '40px', border: 'none', borderRadius: '6px' }}
                />
                <input
                  type="text"
                  value={formData.style.color}
                  onChange={(e) => handleInputChange('style.color', e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Background Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={formData.style.backgroundColor.includes('rgba') ? '#000000' : formData.style.backgroundColor}
                  onChange={(e) => handleInputChange('style.backgroundColor', e.target.value)}
                  style={{ width: '50px', height: '40px', border: 'none', borderRadius: '6px' }}
                />
                <select
                  value={formData.style.backgroundColor.includes('rgba') ? 'rgba' : 'solid'}
                  onChange={(e) => {
                    if (e.target.value === 'rgba') {
                      handleInputChange('style.backgroundColor', 'rgba(0,0,0,0.7)')
                    } else {
                      handleInputChange('style.backgroundColor', '#000000')
                    }
                  }}
                  style={{ flex: 1 }}
                >
                  <option value="solid">Solid</option>
                  <option value="rgba">Semi-transparent</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Font Family</label>
              <select
                value={formData.style.fontFamily}
                onChange={(e) => handleInputChange('style.fontFamily', e.target.value)}
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Impact">Impact</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>

            <div className="form-group">
              <label>Font Weight</label>
              <select
                value={formData.style.fontWeight}
                onChange={(e) => handleInputChange('style.fontWeight', e.target.value)}
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Light</option>
              </select>
            </div>
          </>
        )}

        <div className="form-group">
          <label>Position X</label>
          <input
            type="number"
            value={formData.position.x}
            onChange={(e) => handleInputChange('position.x', parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Position Y</label>
          <input
            type="number"
            value={formData.position.y}
            onChange={(e) => handleInputChange('position.y', parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Width</label>
          <input
            type="number"
            value={formData.size.width}
            onChange={(e) => handleInputChange('size.width', parseInt(e.target.value) || 10)}
            min="10"
          />
        </div>

        <div className="form-group">
          <label>Height</label>
          <input
            type="number"
            value={formData.size.height}
            onChange={(e) => handleInputChange('size.height', parseInt(e.target.value) || 10)}
            min="10"
          />
        </div>
      </form>

      {/* Action Buttons */}
      <div className="button-group" style={{ marginTop: '20px' }}>
        <button 
          type="submit" 
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isSubmitting || loading}
        >
          {isSubmitting ? (
            <>
              <div className="loading"></div>
              Saving...
            </>
          ) : (
            <>
              {selectedOverlay ? '💾 Update Overlay' : '✨ Create Overlay'}
            </>
          )}
        </button>
        
        {selectedOverlay && (
          <button 
            type="button" 
            className="btn btn-danger" 
            onClick={handleDelete}
          >
            🗑️ Delete
          </button>
        )}
        
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={handleClear}
        >
          🔄 Clear
        </button>
      </div>

      {/* Preview */}
      {formData.content && formData.type === 'text' && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#e2e8f0' }}>
            👁️ Preview
          </h4>
          <div
            style={{
              display: 'inline-block',
              padding: '8px 12px',
              fontSize: `${formData.style.fontSize}px`,
              color: formData.style.color,
              backgroundColor: formData.style.backgroundColor,
              fontFamily: formData.style.fontFamily,
              fontWeight: formData.style.fontWeight,
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {formData.content}
          </div>
        </div>
      )}
    </div>
  )
}

export default OverlayEditor