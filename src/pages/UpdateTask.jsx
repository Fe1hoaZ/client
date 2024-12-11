import { API_BASE_URL } from '../util';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Heading } from '@chakra-ui/react';
import TaskForm from '../../components/TaskForm';
import UpdateTaskSkeleton from '../_skeletons/UpdateTaskSkeleton';

export default function UpdateTask() {
    const [task, setTask] = useState();
    const { taskId } = useParams();

    useEffect(() => {
        const fetchTask = async () => {
            const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                credentials: 'include',
            });
            const data = await res.json();
            setTask(data);
        };
        fetchTask();
    }, [taskId]);

    if (!task) {
        return <UpdateTaskSkeleton />;
    }

    const handleFormSubmit = async (updatedData) => {
        // Добавляем текущего владельца в данные формы, если его нет
        const payload = {
            ...updatedData,
            owner: task.owner || updatedData.owner, // Передаем текущего владельца, если он не был изменен
        };

        // Отправляем обновленные данные на сервер
        const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.error('Failed to update task');
        } else {
            const updatedTask = await res.json();
            console.log('Task updated:', updatedTask);
        }
    };

    return (
        <Box p='3' maxW='4xl' mx='auto'>
            <Heading
                as='h1'
                fontSize='3xl'
                fontWeight='semibold'
                textAlign='center'
                my='7'
            >
                Update Task
            </Heading>
            <TaskForm type='update' task={task} onSubmit={handleFormSubmit} />
        </Box>
    );
}
