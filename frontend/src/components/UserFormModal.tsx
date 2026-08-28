import { useEffect, useState, type FormEvent } from 'react';
import { getErrorMessage } from '../api/client';
import { GENDERS, STATUSES, type User, type UserFormValues } from '../types';
import PasswordInput from './PasswordInput';

const EMPTY: UserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phoneNumber: '',
  dateOfBirth: '',
  gender: 'male',
  address: '',
  city: '',
  country: '',
  status: 'active',
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

interface UserFormModalProps {
  user: User | null;
  onClose: () => void;
  onSubmit: (values: Partial<UserFormValues>) => Promise<void>;
}

export default function UserFormModal({ user, onClose, onSubmit }: UserFormModalProps) {
  const isEdit = Boolean(user);
  const [values, setValues] = useState<UserFormValues>(EMPTY);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      setValues(EMPTY);
      return;
    }
    setValues({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
      gender: user.gender,
      address: user.address,
      city: user.city,
      country: user.country,
      status: user.status,
    });
  }, [user]);

  function set<K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    // On edit an empty password means "keep the current one", so it is not sent.
    const payload: Partial<UserFormValues> = { ...values };
    if (isEdit && !payload.password) delete payload.password;

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to save user'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{isEdit ? 'Edit user' : 'Add user'}</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>First name *</span>
              <input
                value={values.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                maxLength={50}
                required
              />
            </label>

            <label className="field">
              <span>Last name *</span>
              <input
                value={values.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                maxLength={50}
                required
              />
            </label>

            <label className="field">
              <span>Email *</span>
              <input
                type="email"
                value={values.email}
                onChange={(e) => set('email', e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>{isEdit ? 'Password' : 'Password *'}</span>
              <PasswordInput
                value={values.password}
                onChange={(value) => set('password', value)}
                placeholder={isEdit ? 'Leave blank to keep current' : 'Min 8 chars, upper, lower, number'}
                autoComplete="new-password"
                required={!isEdit}
              />
            </label>

            <label className="field">
              <span>Phone number *</span>
              <input
                value={values.phoneNumber}
                onChange={(e) => set('phoneNumber', e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Date of birth *</span>
              <input
                type="date"
                value={values.dateOfBirth}
                onChange={(e) => set('dateOfBirth', e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                required
              />
            </label>

            <label className="field">
              <span>Gender *</span>
              <select
                value={values.gender}
                onChange={(e) => set('gender', e.target.value as UserFormValues['gender'])}
              >
                {GENDERS.map((gender) => (
                  <option key={gender} value={gender}>
                    {capitalize(gender)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Status *</span>
              <select
                value={values.status}
                onChange={(e) => set('status', e.target.value as UserFormValues['status'])}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {capitalize(status)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-full">
              <span>Address *</span>
              <input
                value={values.address}
                onChange={(e) => set('address', e.target.value)}
                maxLength={255}
                required
              />
            </label>

            <label className="field">
              <span>City *</span>
              <input
                value={values.city}
                onChange={(e) => set('city', e.target.value)}
                maxLength={100}
                required
              />
            </label>

            <label className="field">
              <span>Country *</span>
              <input
                value={values.country}
                onChange={(e) => set('country', e.target.value)}
                maxLength={100}
                required
              />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
