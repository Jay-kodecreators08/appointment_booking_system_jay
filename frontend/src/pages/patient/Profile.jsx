import { useAuth } from '../../context/AuthContext';

export default function PatientProfile() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="page-title">Profile</h1>
      <div className="form-card">
        <div className="profile-header">
          <span className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
          <div>
            <p className="profile-name">{user?.name}</p>
            <p className="profile-role">Patient Account</p>
          </div>
        </div>
        <div className="profile-row">
          <span className="profile-label">Full Name</span>
          <span>{user?.name}</span>
        </div>
        <div className="profile-row">
          <span className="profile-label">Email</span>
          <span>{user?.email}</span>
        </div>
        <div className="profile-row">
          <span className="profile-label">Phone</span>
          <span>{user?.phone}</span>
        </div>
      </div>
    </div>
  );
}
