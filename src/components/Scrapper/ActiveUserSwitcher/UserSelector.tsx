import { Text, Group, List } from "@mantine/core";
import { Link } from "react-router-dom";

const prepareOptionsForSelect = (data: any[]) => {
    return data.map((item: any) => {
        const label = item.firstName ? `${item.firstName} ${item.lastName}` : item.username;
        return {
            value: item.id,
            label
        }
    });
};

interface UserSelectorProps {
  users: any[];
  usersTasksMap: Record<string, string[]>;
}

export const UserSelector: React.FC<UserSelectorProps> = (props) => {
    const { users, usersTasksMap } = props;
    const preparedUsers = prepareOptionsForSelect(users);

    return (
        <Group>
            <List>
                {preparedUsers.map((user: any) => (
                    <List.Item key={user.value}>
                        {
                            usersTasksMap[user.value] ? (
                                <Link to={`/dashboard/scrapper/user/${user.value}`}>{user.label}</Link>
                            ) : (
                                <Text>{user.label}</Text>
                            )
                        }
                        
                    </List.Item>
                ))}
            </List>
        </Group>
    )
};
