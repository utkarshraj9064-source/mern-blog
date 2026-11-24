import { useState } from 'react';
import PropTypes from 'prop-types';

const empty = { title: '', author: '', content: '' };

export default function PostForm({ initial, onSubmit, onCancel, submitting, error }) {
  const [values, setValues] = useState(
    initial ? { title: initial.title, author: initial.author, content: initial.content } : empty
  );

  const change = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onSubmit(values);
    if (!initial) setValues(empty);
  };

  return (
    <form onSubmit={submit}>
      <input name="title" placeholder="Title" value={values.title} onChange={change} required />
      <input name="author" placeholder="Author" value={values.author} onChange={change} required />
      <textarea
        name="content"
        placeholder="Write something…"
        rows={5}
        value={values.content}
        onChange={change}
        required
      />
      {error && <p className="error">{error}</p>}
      <div className="row">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Update post' : 'Publish post'}
        </button>
        {initial && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

PostForm.propTypes = {
  initial: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  submitting: PropTypes.bool,
  error: PropTypes.string,
};
