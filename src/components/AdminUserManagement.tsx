
import React, { useState } from 'react';
import UserListView from './admin/UserListView';
import UserDetailView from './admin/UserDetailView';
import RoleEditModal from './admin/RoleEditModal';
import { useUserManagement } from '@/hooks/useUserManagement';

type UserRole = 'admin' | 'user';

interface UserWithProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  auth_id: string;
}

const AdminUserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>('user');

  const {
    users,
    loading,
    userCheckins,
    loadUsers,
    loadUserCheckins,
    updateUserRole,
    deleteUser
  } = useUserManagement();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleEditRole = (user: UserWithProfile) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditingRole(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;

    const success = await updateUserRole(selectedUser.id, newRole);
    if (success) {
      setIsEditingRole(false);
    }
  };

  const handleDeleteUser = async (user: UserWithProfile) => {
    if (!confirm(`确定要删除用户 ${user.email} 吗？此操作不可恢复！`)) return;

    await deleteUser(user.id);
  };

  const handleViewUser = async (user: UserWithProfile) => {
    setSelectedUser(user);
    setCurrentView('detail');
    await loadUserCheckins(user.id);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedUser(null);
  };

  if (currentView === 'list') {
    return (
      <>
        <UserListView
          users={users}
          loading={loading}
          searchQuery={searchQuery}
          selectedRole={selectedRole}
          onSearch={handleSearch}
          onRoleSelect={handleRoleSelect}
          onViewUser={handleViewUser}
          onEditRole={handleEditRole}
          onDeleteUser={handleDeleteUser}
          onRefresh={loadUsers}
        />
        <RoleEditModal
          isOpen={isEditingRole}
          user={selectedUser}
          newRole={newRole}
          loading={loading}
          onClose={() => setIsEditingRole(false)}
          onRoleChange={setNewRole}
          onSave={handleSaveRole}
        />
      </>
    );
  }

  if (currentView === 'detail' && selectedUser) {
    const checkins = userCheckins[selectedUser.id] || [];
    
    return (
      <UserDetailView
        user={selectedUser}
        checkins={checkins}
        onBack={handleBackToList}
      />
    );
  }

  return null;
};

export default AdminUserManagement;
