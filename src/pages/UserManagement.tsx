import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, UserPlus, Shield, Key, Mail, User, X, Edit2, Trash2, Save, Eye, EyeOff, RotateCcw, Archive } from 'lucide-react';

export default function UserManagement() {
  const { user, users, deletedUsers, addUser, updateUser, deleteUser, changePassword, reactivateUser, fetchDeletedUsers } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'cashier'>('cashier');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingEmail, setEditingEmail] = useState('');
  const [editingRole, setEditingRole] = useState<'admin' | 'cashier'>('cashier');

  const [pwChangeId, setPwChangeId] = useState<string | null>(null);
  const [pwNew, setPwNew] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);

  // Fetch deleted users when showDeletedUsers becomes true
  useEffect(() => {
    if (user?.role === 'admin' && showDeletedUsers) {
      fetchDeletedUsers();
    }
  }, [user?.role, showDeletedUsers, fetchDeletedUsers]);

  if (user?.role !== 'admin') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg text-center">
        <Shield className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-red-500" />
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Only administrators can manage users.</p>
      </div>
    );
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }

    const result = await addUser({ name: name.trim(), email: email.trim(), role, password });
    if (!result.success) {
      setError(result.error || 'Failed to add user');
      return;
    }

    setSuccess('User added successfully');
    setName('');
    setEmail('');
    setPassword('');
    setRole('cashier');
    setShowForm(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const startEdit = (id: string, name: string, email: string, role: 'admin' | 'cashier') => {
    setEditingId(id);
    setEditingName(name);
    setEditingEmail(email);
    setEditingRole(role);
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    const res = await updateUser(editingId, { name: editingName.trim(), email: editingEmail.trim(), role: editingRole });
    if (!res.success) {
      alert(res.error || 'Failed to update user');
      return;
    }
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return;
    
    // Note: No special restrictions needed for soft delete
    
    const confirmMessage = `Are you sure you want to deactivate "${userToDelete.name}"?\n\nThis will:\n• Hide them from the user list\n• Prevent them from logging in\n• Keep all their bills with original creator name\n• Account can be reactivated later\n\nProceed with deactivation?`;
    
    if (confirm(confirmMessage)) {
      const res = await deleteUser(id);
      if (res.success) {
        alert(`User "${userToDelete.name}" has been deactivated successfully.\nTheir bills will continue to show their original name in history.`);
      } else {
        alert(res.error || 'Failed to deactivate user');
      }
    }
  };

  const handlePasswordChange = async (id: string) => {
    if (!pwNew.trim()) {
      alert('Enter new password');
      return;
    }
    const res = await changePassword(id, pwNew.trim());
    if (!res.success) alert(res.error || 'Failed to change password');
    setPwChangeId(null);
    setPwNew('');
  };

  const handleReactivate = async (id: string) => {
    const userToReactivate = deletedUsers.find(u => u.id === id);
    if (!userToReactivate) return;
    
    const confirmMessage = `Are you sure you want to reactivate "${userToReactivate.name}"?\n\nThis will:\n• Make them visible in the user list again\n• Allow them to log in again\n• Restore their original account\n\nProceed with reactivation?`;
    
    if (confirm(confirmMessage)) {
      const res = await reactivateUser(id);
      if (res.success) {
        alert(`User "${userToReactivate.name}" has been reactivated successfully.`);
      } else {
        alert(res.error || 'Failed to reactivate user');
      }
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="truncate">User Management</span>
          </h1>
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
            <button 
              onClick={() => {
                const newShowDeleted = !showDeletedUsers;
                setShowDeletedUsers(newShowDeleted);
                if (newShowDeleted && user?.role === 'admin') {
                  fetchDeletedUsers();
                }
              }} 
              className={`flex items-center justify-center px-3 py-2.5 font-medium rounded-lg transition-all text-sm ${
                showDeletedUsers 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              <Archive className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{showDeletedUsers ? 'Hide Deleted' : 'Show Deleted'}</span>
            </button>
            <button onClick={() => setShowForm(true)} className="flex items-center justify-center px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all text-sm">
              <UserPlus className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Add User</span>
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">New User</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Name</label>
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" 
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" 
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Role</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as 'admin' | 'cashier')} 
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" 
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <button type="submit" className="flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all text-sm">
                  <Save className="h-4 w-4 mr-2" />
                  Add User
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm">
                  Cancel
                </button>
              </div>
              {(error || success) && (
                <div className="pt-2">
                  {error && <span className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</span>}
                  {success && <span className="text-xs sm:text-sm text-green-600 dark:text-green-400">{success}</span>}
                </div>
              )}
            </form>
          </div>
        )}

        {/* Users List */}
        <div className="space-y-3">
          {users.map((userItem) => (
            <div
              key={userItem.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              {editingId === userItem.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input 
                      className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" 
                      value={editingName} 
                      onChange={(e)=>setEditingName(e.target.value)}
                      placeholder="Name"
                    />
                    <input 
                      className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" 
                      value={editingEmail} 
                      onChange={(e)=>setEditingEmail(e.target.value)}
                      placeholder="Email"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select 
                      className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" 
                      value={editingRole} 
                      onChange={(e)=>setEditingRole(e.target.value as 'admin' | 'cashier')}
                    >
                      <option value="cashier">Cashier</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={handleEditSave} className="flex items-center justify-center px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex-1">
                        <Save className="h-4 w-4 mr-1"/>
                        Save
                      </button>
                      <button onClick={()=>setEditingId(null)} className="px-3 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm flex-1">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={`p-2 rounded-full flex-shrink-0 ${userItem.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
                      {userItem.role === 'admin' ? 
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" /> :
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                      }
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">
                          {userItem.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 w-fit ${
                          userItem.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center text-xs text-gray-700 dark:text-gray-300 truncate">
                          <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{userItem.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-1 sm:gap-2 flex-shrink-0">
                    <button 
                      onClick={()=>startEdit(userItem.id, userItem.name, userItem.email, userItem.role)} 
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                      title="Edit User"
                    >
                      <Edit2 className="h-4 w-4"/>
                    </button>
                    {userItem.id !== user?.id && (
                      <button 
                        onClick={()=>handleDelete(userItem.id)} 
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4"/>
                      </button>
                    )}
                    <button 
                      onClick={()=>{setPwChangeId(userItem.id); setPwNew('');}} 
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                      title="Change Password"
                    >
                      <Key className="h-4 w-4"/>
                    </button>
                  </div>
                </div>
              )}

              {pwChangeId === userItem.id && (
                <div className="mt-3 space-y-3">
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm" 
                      placeholder="Enter new password" 
                      value={pwNew} 
                      onChange={(e)=>setPwNew(e.target.value)} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>handlePasswordChange(userItem.id)} className="flex-1 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">Update</button>
                    <button onClick={()=>setPwChangeId(null)} className="flex-1 px-3 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Deleted Users Section */}
      {showDeletedUsers && (
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Archive className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-orange-500" />
              Deleted Users ({deletedUsers.length})
            </h2>
          </div>

          {deletedUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Archive className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-base sm:text-lg">No deleted users found</p>
              <p className="text-xs sm:text-sm">Deleted users will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deletedUsers.map((userItem) => (
                <div
                  key={userItem.id}
                  className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-900/10"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="p-2 rounded-full flex-shrink-0 bg-orange-100 dark:bg-orange-900/20">
                        {userItem.role === 'admin' ? 
                          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" /> :
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                        }
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">
                            {userItem.name}
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                              userItem.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            }`}>
                              {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                              Deleted
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center mt-1">
                          <div className="flex items-center text-xs text-gray-700 dark:text-gray-300 truncate">
                            <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{userItem.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-2 flex-shrink-0">
                      <button 
                        onClick={() => handleReactivate(userItem.id)} 
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 text-sm"
                        title="Reactivate User"
                      >
                        <RotateCcw className="h-4 w-4"/>
                        <span className="hidden sm:inline">Reactivate</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}