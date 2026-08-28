import { useCallback, useEffect, useState } from 'react';
import { api, getErrorMessage } from '../api/client';
import StatCard from '../components/StatCard';
import type { Gender, ReportSummary, User, UserStatus } from '../types';

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const formatDate = (value: string) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';

export default function ReportPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [rows, setRows] = useState<User[]>([]);
  const [matched, setMatched] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [status, setStatus] = useState<UserStatus | ''>('');
  const [gender, setGender] = useState<Gender | ''>('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        ...(status ? { status } : {}),
        ...(gender ? { gender } : {}),
      };
      const [summaryResponse, listResponse] = await Promise.all([
        api.get<ReportSummary>('/reports/users/summary'),
        api.get<{ data: User[]; total: number }>('/reports/users', { params }),
      ]);
      setSummary(summaryResponse.data);
      setRows(listResponse.data.data);
      setMatched(listResponse.data.total);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load report'));
    } finally {
      setLoading(false);
    }
  }, [status, gender]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>User Report</h1>
          <p className="page-sub">Overview of the user base</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stat-grid">
        <StatCard label="Total users" value={summary?.total ?? 0} tone="accent" />
        <StatCard label="Active" value={summary?.active ?? 0} tone="success" />
        <StatCard label="Inactive" value={summary?.inactive ?? 0} tone="muted" />
        <StatCard label="New (30 days)" value={summary?.newLast30Days ?? 0} />
      </div>

      <section className="panel">
        <h2 className="panel-title">Gender distribution</h2>
        <div className="bars">
          {(summary?.byGender ?? []).map((item) => (
            <div className="bar-row" key={item.gender}>
              <span className="bar-label">{capitalize(item.gender)}</span>
              <div className="bar-track">
                <div className={`bar-fill bar-${item.gender}`} style={{ width: `${item.percentage}%` }} />
              </div>
              <span className="bar-value">
                {item.count} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2 className="panel-title">Detailed records</h2>
          <div className="toolbar toolbar-inline">
            <select
              className="toolbar-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus | '')}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              className="toolbar-select"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender | '')}
            >
              <option value="">All genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <p className="panel-meta">
          {matched} record{matched === 1 ? '' : 's'} matched
        </p>

        {loading ? (
          <div className="table-state">Loading report...</div>
        ) : rows.length === 0 ? (
          <div className="table-state">No users match these filters.</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Gender</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((user) => (
                  <tr key={user.id}>
                    <td data-label="Name" className="cell-strong">
                      {user.firstName} {user.lastName}
                    </td>
                    <td data-label="Email">{user.email}</td>
                    <td data-label="Gender" className="cell-capitalize">
                      {user.gender}
                    </td>
                    <td data-label="Location">
                      {user.city}, {user.country}
                    </td>
                    <td data-label="Status">
                      <span className={`pill pill-${user.status}`}>{user.status}</span>
                    </td>
                    <td data-label="Created">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
