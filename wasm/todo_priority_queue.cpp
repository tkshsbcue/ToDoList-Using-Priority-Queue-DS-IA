#include <emscripten/bind.h>
#include <queue>
#include <vector>
#include <string>

struct Todo {
    int id;
    std::string text;
    bool completed;
    std::string priority;
    long long dueDate;  // Timestamp in milliseconds
};

struct CompareTodo {
    bool operator()(const Todo& a, const Todo& b) {
        if (a.priority != b.priority) {
            if (a.priority == "high") return false;
            if (b.priority == "high") return true;
            if (a.priority == "medium") return false;
            if (b.priority == "medium") return true;
        }
        if (a.dueDate != 0 && b.dueDate != 0) {
            return a.dueDate > b.dueDate;
        }`
        if (a.dueDate != 0) return false;
        if (b.dueDate != 0) return true;
        return a.id > b.id;
    }
};

class PriorityQueue {
private:
    std::priority_queue<Todo, std::vector<Todo>, CompareTodo> pq;

public:
    void push(int id, const std::string& text, bool completed, const std::string& priority, long long dueDate) {
        pq.push({id, text, completed, priority, dueDate});
    }

    bool empty() const {
        return pq.empty();
    }

    Todo top() const {
        return pq.top();
    }

    void pop() {
        pq.pop();
    }

    std::vector<Todo> getAllSorted() {
        std::vector<Todo> result;
        while (!pq.empty()) {
            result.push_back(pq.top());
            pq.pop();
        }
        for (const auto& todo : result) {
            pq.push(todo);
        }
        return result;
    }
};

// Binding code
EMSCRIPTEN_BINDINGS(priority_queue_module) {
    emscripten::class_<PriorityQueue>("PriorityQueue")
        .constructor<>()
        .function("push", &PriorityQueue::push)
        .function("empty", &PriorityQueue::empty)
        .function("top", &PriorityQueue::top)
        .function("pop", &PriorityQueue::pop)
        .function("getAllSorted", &PriorityQueue::getAllSorted);

    emscripten::value_object<Todo>("Todo")
        .field("id", &Todo::id)
        .field("text", &Todo::text)
        .field("completed", &Todo::completed)
        .field("priority", &Todo::priority)
        .field("dueDate", &Todo::dueDate);
}

/*
em++ -O3 -s WASM=1 -s MODULARIZE=1 -s EXPORT_NAME="createTodoPriorityQueueModule" \
    -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' \
    -s ALLOW_MEMORY_GROWTH=1 \
    -o public/todopriority_queue.js /Users/kumartanay/IA/wasm/todo_priority_queue.cpp


*/