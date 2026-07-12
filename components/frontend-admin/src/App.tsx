import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, type Blog, type Post, type User } from './api';

const MAX_CHARS = 300; // short-post limit (PLAN.md section 14 — the inline composer)

type Session = { user: User; blog: Blog };

export function App() {
  const [session, setSession] = useState<Session | undefined>();
  const [loading, setLoading] = useState(true);

  // On load, prove the cookie (me) and discover the blog to write to (blogs). A 401 just means
  // "not logged in" → fall through to the login screen; anything else surfaces.
  const refresh = useCallback(async () => {
    try {
      const [{ user }, { blogs }] = await Promise.all([api.me(), api.blogs()]);
      setSession(blogs[0] ? { user, blog: blogs[0] } : undefined);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setSession(undefined);
      else throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (loading) return <main className="center">Loading…</main>;
  if (!session) return <Login onLoggedIn={refresh} />;
  return <Dashboard session={session} onLogout={() => setSession(undefined)} />;
}

function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.login(email, password);
      onLoggedIn();
    } catch {
      setError('Invalid email or password.');
      setBusy(false);
    }
  }

  return (
    <main className="center">
      <form className="card" onSubmit={submit}>
        <h1>thatblog</h1>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}

function Dashboard({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const { user, blog } = session;
  const [posts, setPosts] = useState<Post[]>([]);

  const loadPosts = useCallback(async () => {
    setPosts((await api.listPosts(blog.blogId)).posts);
  }, [blog.blogId]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  async function logout() {
    await api.logout();
    onLogout();
  }

  return (
    <main className="dashboard">
      <header>
        <h1>{blog.name}</h1>
        <div className="who">
          <span>{user.displayName ?? user.email}</span>
          <button className="link" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>
      <Composer blogId={blog.blogId} onPosted={loadPosts} />
      <PostList posts={posts} />
    </main>
  );
}

function Composer({ blogId, onPosted }: { blogId: string; onPosted: () => void }) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const remaining = MAX_CHARS - value.length;
  const canPost = value.trim().length > 0 && remaining >= 0 && !busy;

  // "Save draft" creates the post; "Publish" creates it then publishes (two calls — the API keeps
  // create and publish as separate steps so a draft never hits the public timeline by accident).
  async function submit(publish: boolean) {
    setBusy(true);
    setError('');
    try {
      const { post } = await api.createPost(blogId, value.trim());
      if (publish) await api.publishPost(blogId, post.postId);
      setValue('');
      onPosted();
    } catch {
      setError('Could not save. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="composer">
      <textarea
        placeholder="What's happening?"
        value={value}
        maxLength={MAX_CHARS}
        rows={4}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="composer-actions">
        <span className={remaining < 20 ? 'count low' : 'count'}>{remaining}</span>
        <button className="secondary" disabled={!canPost} onClick={() => submit(false)}>
          Save draft
        </button>
        <button disabled={!canPost} onClick={() => submit(true)}>
          Publish
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </section>
  );
}

function PostList({ posts }: { posts: Post[] }) {
  if (!posts.length) return <p className="empty">No posts yet — write your first above.</p>;
  return (
    <ul className="posts">
      {posts.map((post) => (
        <li key={post.postId}>
          <span className={`badge ${post.status}`}>{post.status}</span>
          <span className="slug">{post.slug ?? post.postId}</span>
          <time>{new Date(post.publishedAt ?? post.createdAt).toLocaleString()}</time>
        </li>
      ))}
    </ul>
  );
}
