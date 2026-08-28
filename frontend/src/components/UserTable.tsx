import type { User } from '../types';

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const formatDate = (value: string) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';

export default function UserTable({ users, loading, onEdit, onDelete }: UserTableProps) {
  if (loading) return <div className="table-state">Loading users...</div>;
  if (!users.length) return <div className="table-state">No users match your filters.</div>;

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Location</th>
            <th>Gender</th>
            <th>Status</th>
            <th>Created</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td data-label="Name" className="cell-strong">
                {user.firstName} {user.lastName}
              </td>
              <td data-label="Email">{user.email}</td>
              <td data-label="Phone">{user.phoneNumber}</td>
              <td data-label="Location">
                {user.city}, {user.country}
              </td>
              <td data-label="Gender" className="cell-capitalize">
                {user.gender}
              </td>
              <td data-label="Status">
                <span className={`pill pill-${user.status}`}>{user.status}</span>
              </td>
              <td data-label="Created">{formatDate(user.createdAt)}</td>
              <td data-label="Actions" className="col-actions">
                <button className="btn btn-sm btn-ghost" onClick={() => onEdit(user)}>
                  Edit
                </button>
                <button className="btn btn-sm btn-danger-ghost" onClick={() => onDelete(user)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
