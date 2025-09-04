import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, UserPlus, Shield, Key, Mail, User, X, Edit2, Trash2, Save, Eye, EyeOff } from 'lucide-react';

export default function UserManagement() {
  const { user, users, addUser, updateUser, deleteUser, changePassword } = useAuth();

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

  if (user?.role !== 'admin') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center">
        <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400">Only administrators can manage users.</p>
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
    if (confirm('Delete this user?')) {
      const res = await deleteUser(id);
      if (!res.success) alert(res.error || 'Failed to delete user');
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

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="h-6 w-6 mr-3" />
            User Management
          </h1>
          <button onClick={() => setShowForm(true)} className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>

        {showForm && (
          <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">New User</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'cashier')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                  <option value="cashier">Cashier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" 
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
              <div className="md:col-span-2 flex items-center gap-3">
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all">Save User</button>
                {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
                {success && <span className="text-sm text-green-600 dark:text-green-400">{success}</span>}
              </div>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <input className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" value={editingName} onChange={(e)=>setEditingName(e.target.value)} />
                  <input className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" value={editingEmail} onChange={(e)=>setEditingEmail(e.target.value)} />
                  <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" value={editingRole} onChange={(e)=>setEditingRole(e.target.value as 'admin' | 'cashier')}>
                    <option value="cashier">Cashier</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="flex gap-2">
                    <button onClick={handleEditSave} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"><Save className="h-4 w-4 mr-1"/>Save</button>
                    <button onClick={()=>setEditingId(null)} className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${userItem.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
                      {userItem.role === 'admin' ? 
                        <Shield className={`h-5 w-5 ${userItem.role === 'admin' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`} /> :
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      }
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">{userItem.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          userItem.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                          <Mail className="h-4 w-4 mr-1" />
                          {userItem.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={()=>startEdit(userItem.id, userItem.name, userItem.email, userItem.role)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"><Edit2 className="h-4 w-4"/></button>
                    {userItem.id !== user?.id && (
                      <button onClick={()=>handleDelete(userItem.id)} className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300"><Trash2 className="h-4 w-4"/></button>
                    )}
                    <button onClick={()=>{setPwChangeId(userItem.id); setPwNew('');}} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"><Key className="h-4 w-4"/></button>
                  </div>
                </div>
              )}

              {pwChangeId === userItem.id && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" 
                      placeholder="New password" 
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
                  <button onClick={()=>handlePasswordChange(userItem.id)} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Update</button>
                  <button onClick={()=>setPwChangeId(null)} className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg">Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}