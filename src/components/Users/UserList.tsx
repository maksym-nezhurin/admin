import { Title, Text } from "@mantine/core";

interface UserListProps {
  users?: any[];
}

export const UserList: React.FC<UserListProps> = () => {
    return (
        <>
            <Title order={4}>Users</Title>
            <Text>Users List</Text>
        </>
    )
};
