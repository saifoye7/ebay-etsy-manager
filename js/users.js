
document.addEventListener('DOMContentLoaded', function() {
    const user = checkAuth();
    if (!user) return;

    if (user.role !== 'admin') {
        showToast('Access Denied: Admin only', 'error');
        window.location.href = 'index.html';
        return;
    }

    loadUsers();
    document.getElementById('user-search').addEventListener('input', debounce(loadUsers, 300));
    document.getElementById('user-form').addEventListener('submit', handleUserSubmit);
});

function loadUsers() {
    const search = document.getElementById('user-search').value.toLowerCase();
    const users = DB.getUsers().filter(u => 
        !search || u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
    );

    const tbody = document.getElementById('users-table-body');
    const currentUser = getCurrentUser();

    tbody.innerHTML = users.map(u => {
        const roleColors = { admin: 'bg-purple-100 text-purple-700', manager: 'bg-blue-100 text-blue-700', viewer: 'bg-gray-100 text-gray-700' };
        const isSelf = u.id === currentUser.id;

        return `
            <tr>
                <td class="font-medium text-gray-800">${u.id}</td>
                <td class="text-sm text-gray-800">${u.name} ${isSelf ? '<span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-1">You</span>' : ''}</td>
                <td class="text-sm text-gray-600">${u.email}</td>
                <td><span class="text-xs font-semibold px-2 py-1 rounded-full ${roleColors[u.role] || 'bg-gray-100'}">${u.role}</span></td>
                <td class="text-sm text-gray-500">${formatDate(u.created_at)}</td>
                <td>
                    <div class="flex gap-2">
                        <button onclick="editUser(${u.id})" class="text-blue-600 hover:text-blue-800 p-1"><i class="fas fa-edit"></i></button>
                        ${!isSelf ? `<button onclick="deleteUser(${u.id})" class="text-red-600 hover:text-red-800 p-1"><i class="fas fa-trash"></i></button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function handleUserSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('user-id').value;
    const userData = {
        name: document.getElementById('user-fullname').value,
        email: document.getElementById('user-email').value,
        password: document.getElementById('user-password').value,
        role: document.getElementById('user-role-select').value
    };

    if (id) {
        const existing = DB.getUserById(parseInt(id));
        if (existing && userData.password === '********') {
            delete userData.password;
        }
        DB.updateUser(parseInt(id), userData);
        showToast('User updated successfully!', 'success');
    } else {
        if (DB.getUserByEmail(userData.email)) {
            showToast('Email already exists!', 'error');
            return;
        }
        DB.addUser(userData);
        showToast('User created successfully!', 'success');
    }

    closeModal('user-modal');
    resetUserForm();
    loadUsers();
}

function editUser(id) {
    const u = DB.getUserById(id);
    if (!u) return;

    document.getElementById('user-modal-title').textContent = 'Edit User';
    document.getElementById('user-id').value = u.id;
    document.getElementById('user-fullname').value = u.name;
    document.getElementById('user-email').value = u.email;
    document.getElementById('user-password').value = '********';
    document.getElementById('user-role-select').value = u.role;

    openModal('user-modal');
}

function deleteUser(id) {
    const currentUser = getCurrentUser();
    if (id === currentUser.id) {
        showToast('Cannot delete yourself!', 'error');
        return;
    }
    confirmAction('Are you sure you want to delete this user?', () => {
        DB.deleteUser(id);
        showToast('User deleted successfully!', 'success');
        loadUsers();
    });
}

function resetUserForm() {
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = '';
    document.getElementById('user-modal-title').textContent = 'Add User';
}
