import PropTypes from 'prop-types';

export default function PostCard({ post, onEdit, onDelete }) {
  return (
    <article className="card">
      <h3>{post.title}</h3>
      <p className="muted">
        by {post.author} · {new Date(post.createdAt).toLocaleString()}
      </p>
      <p className="content">{post.content}</p>
      <div className="row">
        <button className="secondary" onClick={onEdit}>
          Edit
        </button>
        <button className="danger" onClick={onDelete}>
          Delete
        </button>
      </div>
    </article>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    author: PropTypes.string,
    content: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
