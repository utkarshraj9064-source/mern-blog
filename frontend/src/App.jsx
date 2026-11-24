import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPosts, createPost, updatePost, deletePost, API_BASE } from './api.js';
import PostForm from './components/PostForm.jsx';
import PostCard from './components/PostCard.jsx';

export default function App() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data: posts = [], isLoading, isError, error } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['posts'] });

  const createMutation = useMutation({ mutationFn: createPost, onSuccess: invalidate });
  const updateMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      setEditing(null);
      invalidate();
    },
  });
  const deleteMutation = useMutation({ mutationFn: deletePost, onSuccess: invalidate });

  const handleSubmit = (values) => {
    if (editing) updateMutation.mutate({ id: editing._id, ...values });
    else createMutation.mutate(values);
  };

  const activeMutation = editing ? updateMutation : createMutation;

  return (
    <div className="container">
      <header>
        <h1>MERN Blog</h1>
        <p className="muted">API: {API_BASE}</p>
      </header>

      <section className="card">
        <h2>{editing ? 'Edit post' : 'Create a post'}</h2>
        <PostForm
          key={editing ? editing._id : 'new'}
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
          submitting={activeMutation.isPending}
          error={activeMutation.error?.message}
        />
      </section>

      <section>
        <h2>Posts ({posts.length})</h2>
        {isLoading && <p>Loading posts…</p>}
        {isError && <p className="error">Could not load posts: {error.message}</p>}
        {!isLoading && !isError && posts.length === 0 && (
          <p className="muted">No posts yet. Create the first one above.</p>
        )}
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onEdit={() => setEditing(post)}
            onDelete={() => deleteMutation.mutate(post._id)}
          />
        ))}
      </section>
    </div>
  );
}
