// pages/forums/create.js

import React, { useState } from 'react';

export default function CreateForumPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/forums/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setTitle('');
        setContent('');
      } else {
        setMessage(data.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('An error occurred');
    }
  };

  return (
    <div>
      <h1>Create Forum Thread</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label><br />
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="content">Content:</label><br />
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Thread</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
