import { useEffect, useState } from 'react';
import { Text, Title, Stack, Group, Button, MultiSelect, ActionIcon, Modal, Alert, Badge, Paper } from '@mantine/core';
import { useTypedTranslation } from '../i18n';
import { useRoles } from '../hooks/useRoles';
import { authService } from '../services/auth';
import { IconTrash, IconUserOff, IconSettings } from '@tabler/icons-react';
import { RoleGuard } from '../components/RoleGuard';

const UsersPage = () => {
    const { t } = useTypedTranslation();
    const [availableRoles, setAvailableRoles] = useState<any[]>([]);
    const { getAvailableRoles, assignRole, removeRole } = useRoles();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const onHandleGetAllUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const allUsers = await authService.getAllUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error('Failed to fetch all users:', error);
            setError(t('users.load_error'));
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableRoles = async () => {
        try {
            setError(null);
            const roles = await getAvailableRoles();
            setAvailableRoles(roles);
        } catch (error) {
            console.error('Failed to load available roles:', error);
            setError(t('users.roles_load_error'));
        }
    };

    const handleAssignRoles = async () => {
        if (!selectedUser || selectedRoles.length === 0) return;

        try {
            setError(null);
            // Призначити ролі за іменами (бекенд очікує roles: string[])
            await assignRole(selectedUser.id, selectedRoles);
        } catch (error) {
            console.error('Failed to assign roles:', error);
            setError(t('users.assign_error'));
        } finally {
            await onHandleGetAllUsers(); // Refresh users list
            setRoleModalOpen(false);
            setSelectedRoles([]);
        }
    };

    const handleRemoveRole = async (userId: string, roleId: string) => {
        try {
            setError(null);
            await removeRole(userId, roleId);
            await onHandleGetAllUsers(); // Refresh users list
        } catch (error) {
            console.error('Failed to remove role:', error);
            setError(t('users.remove_role_error'));
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm(t('users.confirm_delete'))) return;

        try {
            setError(null);
            await authService.deleteUser(userId, true); // soft delete by default
            await onHandleGetAllUsers(); // Refresh users list
        } catch (error) {
            console.error('Failed to delete user:', error);
            setError(t('users.delete_error'));
        }
    };

    const openRoleModal = (user: any) => {
        setSelectedUser(user);
        // Використовуємо імена ролей як value для Select
        setSelectedRoles(user.roles?.map((r: any) => r.role.name) || []);
        setRoleModalOpen(true);
    };

    useEffect(() => {
        onHandleGetAllUsers();
        loadAvailableRoles();
    }, []);

    return (
        <Stack>
            <Title order={2}>{t('users.title')}</Title>

            {loading && (
                <Alert color="blue" variant="light">
                    {t('users.loading')}
                </Alert>
            )}
            {error && (
                <Alert color="red" variant="light">
                    {error}
                </Alert>
            )}

            <RoleGuard roles={['ADMIN', 'SUPER_ADMIN']} fallback={<Alert color="red">{t('common.error')}</Alert>}>
                {!loading && !error && users.length === 0 && (
                    <Alert color="gray" variant="light">
                        {t('users.empty')}
                    </Alert>
                )}

                <Stack>
                    {users.map((user: any) => (
                        <Paper key={user.id} withBorder shadow="xs" radius="md" p="md">
                            <Group position="apart" align="flex-start">
                                <Stack spacing={4}>
                                    <Text fw={600}>{user.username}</Text>
                                    <Text size="sm" c="dimmed">{user.email}</Text>
                                    <Group mt={6} spacing={6}>
                                        {user.roles?.map((userRole: any) => (
                                            <Badge
                                                key={userRole.role.id}
                                                variant="light"
                                                size="sm"
                                                rightSection={
                                                    <ActionIcon
                                                        variant="subtle"
                                                        size="xs"
                                                        color="red"
                                                        onClick={() => handleRemoveRole(user.id, userRole.role.id)}
                                                    >
                                                        <IconUserOff size={10} />
                                                    </ActionIcon>
                                                }
                                            >
                                                {userRole.role.name}
                                            </Badge>
                                        ))}
                                    </Group>
                                </Stack>

                                {/* Кнопки дій */}
                                <Group>
                                    <ActionIcon
                                        variant="light"
                                        color="blue"
                                        onClick={() => openRoleModal(user)}
                                        title={t('users.manage_roles')}
                                    >
                                        <IconSettings size={16} />
                                    </ActionIcon>

                                    <RoleGuard roles={['SUPER_ADMIN']}>
                                        <ActionIcon
                                            variant="light"
                                            color="red"
                                            onClick={() => handleDeleteUser(user.id)}
                                            title={t('users.delete_user')}
                                        >
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </RoleGuard>
                                </Group>
                            </Group>
                        </Paper>
                    ))}
                </Stack>
            </RoleGuard>

            {/* Модальне вікно управління ролями */}
            <Modal
                opened={roleModalOpen}
                onClose={() => setRoleModalOpen(false)}
                title={`${t('users.manage_roles')} - ${selectedUser?.username}`}
                centered
                zIndex={3001}
                size="xl"
            >
                <Stack style={{ minHeight: '300px' }}>
                    <MultiSelect 
                        label={t('users.select_roles')}
                        placeholder={t('users.choose_roles')}
                        data={availableRoles.map((role: any) => ({ 
                            value: role.value, 
                            label: `${role.label} (Level ${role.level})` 
                        }))}
                        value={selectedRoles}
                        onChange={(values) => setSelectedRoles(values)}
                        searchable
                    />
                    
                    <Group position="right">
                        <Button variant="light" onClick={() => setRoleModalOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleAssignRoles}>
                            {t('users.assign_roles')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    );
};

export default UsersPage;