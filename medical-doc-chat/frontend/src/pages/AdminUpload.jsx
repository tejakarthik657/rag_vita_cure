import React, { useState } from 'react';

const AdminUpload = () => {
  const [file, setFile] = useState(null);

  const handleUpload = (e) => {
    e.preventDefault();
    // Upload logic here
  };

  return (
    <div className="admin-upload">
      <h2>Admin File Management</h2>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default AdminUpload;