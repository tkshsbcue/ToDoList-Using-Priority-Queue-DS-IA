// priorityQueueWasm.ts

interface Todo {
    id: number;
    text: string;
    completed: boolean;
    priority: "low" | "medium" | "high";
    dueDate: number | null;
  }
  
  interface PriorityQueueModule {
    PriorityQueue: {
      new(): PriorityQueue;
    };
  }
  
  interface PriorityQueue {
    push(id: number, text: string, completed: boolean, priority: string, dueDate: number): void;
    empty(): boolean;
    top(): Todo;
    pop(): void;
    getAllSorted(): Todo[];
  }
  
  declare function createTodoPriorityQueueModule(): Promise<PriorityQueueModule>;
  
  let wasmModule: PriorityQueueModule | null = null;
  
  export async function initWasmModule() {
    if (!wasmModule) {
      wasmModule = await createTodoPriorityQueueModule();
    }
  }
  
  export function createPriorityQueue(): PriorityQueue | null {
    if (!wasmModule) {
      console.error("Wasm module not initialized. Call initWasmModule first.");
      return null;
    }
    return new wasmModule.PriorityQueue();
  }
  
  export function sortTodos(todos: Todo[]): Todo[] {
    const pq = createPriorityQueue();
    if (!pq) return todos;
  
    todos.forEach(todo => {
      pq.push(todo.id, todo.text, todo.completed, todo.priority, todo.dueDate ? todo.dueDate.getTime() : 0);
    });
  
    return pq.getAllSorted();
  }