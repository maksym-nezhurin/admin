import { useState, useEffect } from "react";
import { Title, Text } from "@mantine/core";
import { scrapperServices } from "../../services/scrapper";
import { authService } from "../../services/auth";
import { UserSelector } from "./ActiveUserSwitcher/UserSelector";

export const ActiveUserSwitcher = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [usersTasksMap, setUsersTasksMap] = useState<Record<string, string[]>>({});

    const onHandleGetAllUsers = async () => {
        try {
            const allUsers = await authService.getAllUsers();

            setUsers(allUsers);
        } catch (error) {
            console.error('Failed to fetch all users:', error);
        }
    };

    const onHandleGetAllTasks = async () => {
        try {
            const data = await scrapperServices.getAllUsersTasks();
            const { tasks } = data;
            
            // Create a map of user IDs to their task IDs
            const usersMap: Record<string, string[]> = {};
            tasks.forEach((task: any) => {
                if (!usersMap[task.user_id]) {
                    usersMap[task.user_id] = [];
                }
                usersMap[task.user_id].push(task.task_id);
            });
            
            setUsersTasksMap(usersMap);
        } catch (error) {
            console.error('Failed to fetch all tasks:', error);
        }
    };

    const onHandleGetAllData = async () => {
        await Promise.all([
            onHandleGetAllUsers(),
            onHandleGetAllTasks()
        ]);
    };

    useEffect(() => {
        onHandleGetAllData();
    }, []);

    return (
        <>
            <Title order={4}>
                Active User Switcher
            </Title>

            <UserSelector users={users} usersTasksMap={usersTasksMap} />

            {/* Display Users */}
            {users.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                    <Title order={5}>Users ({users.length})</Title>
                    {users.map((user: any) => (
                        <Text key={user.id} size="sm">
                            {user.username} ({user.email}) - Roles: {user.roles?.map((r: any) => r.role?.name).join(', ') || 'None'}
                        </Text>
                    ))}
                </div>
            )}

            {/* Display Users with their Tasks */}
            {Object.keys(usersTasksMap).length > 0 && (
                <div>
                    <Title order={5}>Users with Tasks</Title>
                    {Object.entries(usersTasksMap).map(([userId, taskIds]) => {
                        const user = users.find(u => u.id === userId);
                        return (
                            <div key={userId} style={{ marginBottom: '0.5rem' }}>
                                <Text weight={500}>
                                    {user?.username || userId} ({user?.email}) - {taskIds.length} tasks
                                </Text>
                                <Text size="xs" c="dimmed" ml="md">
                                    Task IDs: {taskIds.join(', ')}
                                </Text>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    )
}