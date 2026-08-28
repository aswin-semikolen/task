import { useCallback, useEffect, useRef, useState } from 'react';
import { api, getErrorMessage } from '../api/client';
import ConfirmDialog from '../components/ConfirmDialog';
import UserFormModal from '../components/UserFormModal';
import UserTable from '../components/UserTable';
import type { Paginated, User, UserFormValues, UserStatus } from '../types';

const PAGE_SIZE = 10;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<UserStatus | ''>('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Debounce the search box so typing does not fire a request per keystroke.
  const firstRender = useRef(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      if (!firstRender.current) setPage(1);
      firstRender.current = false;
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get<Paginated<User>>('/users', {
        params: {
          page,
          limit: PAGE_SIZE,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
        },
      });
      setUsers(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load users'));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setFormOpen(true);
  }

  async function handleSubmit(values: Partial<UserFormValues>) {
    if (editing) {
      await api.patch(`/users/${editing.id}`, values);
    } else {
      await api.post('/users', values);
      setPage(1);
    }
    setFormOpen(false);
    setEditing(null);
    await fetchUsers();
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await api.delete(`/users/${deleting.id}`);
      setDeleting(null);
      // Stepping back a page avoids landing on an empty last page after a delete.
      if (users.length === 1 && page > 1) setPage(page - 1);
      else await fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete user'));
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Users</h1>
          <p className="page-sub">{total} user{total === 1 ? '' : 's'} registered</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add user
        </button>
      </div>

      <div className="toolbar">
        <input
          className="toolbar-search"
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select
          className="toolbar-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as UserStatus | '');
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <UserTable users={users} loading={loading} onEdit={openEdit} onDelete={setDeleting} />

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Next
          </button>
        </div>
      )}

      {formOpen && (
        <UserFormModal
          user={editing}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete user"
          message={`Delete ${deleting.firstName} ${deleting.lastName}? This cannot be undone.`}
          busy={deleteBusy}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
