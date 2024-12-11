import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { API_BASE_URL } from '../util';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Badge,
    Box,
    Button,
    Flex,
    Heading,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
} from '@chakra-ui/react';
import TasksSkeleton from '../_skeletons/TasksSkeleton';
import Pagination from '../../components/Pagination';
import { BsArrowUp } from 'react-icons/bs';

export default function Tasks() {
    const { user } = useUser();
    const [tasks, setTasks] = useState();
    const [searchParams, setSearchParams] = useSearchParams();
    const [itemCount, setItemCount] = useState(0);
    const page = parseInt(searchParams.get('page'), 10) || 1;
    const [pageSize, setPageSize] = useState(5);  // Дефолтное количество элементов на странице

    const handleStatusFilter = (e) => {
        const value = e.target.value;
        if (value) {
            searchParams.set('status', value);
        } else {
            searchParams.delete('status');
        }
        setSearchParams(searchParams);
    };

    const handleOrderBy = (value) => {
        searchParams.set('orderBy', value);
        setSearchParams(searchParams);
    };

    const handleCompleteTask = async (taskId) => { // Событие при нажатии по кнопке Complete (строка 180)
        try {
            // Отправка запроса на сервер для обновления статуса задачи
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'done' }), // Передается только статус
            });
    
            if (!response.ok) {
                throw new Error(`Failed to update task status: ${response.statusText}`);
            }
    
            // Обновление задачи в состоянии
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === taskId ? { ...task, status: 'done' } : task
                )
            );
        } catch (err) {
            console.error('Failed to complete the task:', err);
        }
    };

    // Обработчик изменения количества элементов на странице
    const handlePageSizeChange = (e) => {
        setPageSize(parseInt(e.target.value, 15));  // Обновляем pageSize
    };

    useEffect(() => {
        const fetchTasks = async () => {
            const query = searchParams.size ? `?${searchParams.toString()}` : '';
            const res = await fetch(`${API_BASE_URL}/tasks/user/${user._id}${query}`, {
                credentials: 'include',
            });
            const { tasks, taskCount } = await res.json();
            setTasks(tasks);
            setItemCount(taskCount);
        };

        if (user?._id) {
            fetchTasks();
        }
    }, [searchParams, user]);

    if (!tasks) {
        return <TasksSkeleton />;
    }

    // Обрезаем список задач на основе pageSize
    const paginatedTasks = tasks.slice(0, pageSize);

    return (
        <Box p="5" maxW="3lg" mx="auto">
            <Heading as="h1" fontSize="3xl" fontWeight="semibold" textAlign="center" my="7">
                Tasks to do
            </Heading>

            <Flex justify="space-between" mt="5" mb="3">
                <Box w="100px">
                    <Select placeholder="All" onChange={handleStatusFilter}>
                        <option value="open">Open</option>
                        <option value="done">Done</option>
                    </Select>
                </Box>
                <Box w="100px">
                    <Select value={pageSize} onChange={handlePageSizeChange}>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={8}>8</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </Select>
                </Box>
                <Button colorScheme="green" textTransform="uppercase" fontWeight="semibold">
                    <Link to="/create-task">Create New Task</Link>
                </Button>
            </Flex>

            <TableContainer>
                <Table px="3" border="2px solid" borderColor="gray.100">
                    <Thead backgroundColor="gray.100">
                        <Tr>
                            <Th>
                                <Flex onClick={() => handleOrderBy('name')} cursor="pointer" alignItems="center">
                                    Task {searchParams.get('orderBy') === 'name' && <BsArrowUp />}
                                </Flex>
                            </Th>
                            <Th>
                                <Flex onClick={() => handleOrderBy('priority')} cursor="pointer" alignItems="center">
                                    Priority {searchParams.get('orderBy') === 'priority' && <BsArrowUp />}
                                </Flex>
                            </Th>
                            <Th>
                                <Flex onClick={() => handleOrderBy('status')} cursor="pointer" alignItems="center">
                                    Status {searchParams.get('orderBy') === 'status' && <BsArrowUp />}
                                </Flex>
                            </Th>
                            <Th>
                                <Flex onClick={() => handleOrderBy('due')} cursor="pointer" alignItems="center">
                                    Due Date {searchParams.get('orderBy') === 'due' && <BsArrowUp />}
                                </Flex>
                            </Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {paginatedTasks.map((task) => (
                            <Tr key={task._id}>
                                <Td>
                                    <Link to={`/tasks/${task._id}`}>{task.name}</Link>
                                </Td>
                                <Td>
                                    <Badge colorScheme={task.priority === 'urgent' ? 'red' : 'gray'}>
                                        {task.priority}
                                    </Badge>
                                </Td>
                                <Td>
                                    <Badge colorScheme={task.status === 'open' ? 'orange' : 'green'}>
                                        {task.status}
                                    </Badge>
                                </Td>
                                <Td>{task.due ? new Date(task.due).toDateString() : ''}</Td>
                                <Td>
                                    {task.status === 'open' && (
                                        <Button
                                            colorScheme="blue"
                                            size="sm"
                                            onClick={() => handleCompleteTask(task._id)}
                                        >
                                            Complete
                                        </Button>
                                    )}
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
}
