import axiosInstance from "./axiosConfig";
import { TodoItem } from "./components/List";

export const fetchData = async (
  token: string,
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>,
  setError: React.Dispatch<React.SetStateAction<string>>
) => {
  try {
    if (!token) {
      setError("Authorization token is missing.");
      return;
    }

    const response = await axiosInstance.get("/todo/get");

    if (response && response.data && response.data.data) {
      const initialTodos: TodoItem[] = response.data.data.map((item: any) => ({
        ...item,
        checked: item.status === "Completed",
      }));
      setTodos(initialTodos);
    }
  } catch (error) {
    console.error("Error fetching todos:", error);
    setError("Error fetching todos: " + error);
  }
};
