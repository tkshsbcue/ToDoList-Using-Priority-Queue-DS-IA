#include <emscripten/bind.h>
#include <queue>
#include <string>
#include <vector>

struct Task {
    std::string description;
    int priority;

    Task(const std::string& desc, int prio) : description(desc), priority(prio) {}
};

struct CompareTask {
    bool operator()(const Task& t1, const Task& t2) {
        return t1.priority < t2.priority;
    }
};

class TodoList {
private:
    std::priority_queue<Task, std::vector<Task>, CompareTask> tasks;

public:
    void addTask(const std::string& description, int priority) {
        tasks.emplace(description, priority);
    }

    std::string getNextTask() {
        if (tasks.empty()) {
            return "No tasks available";
        }
        Task nextTask = tasks.top();
        tasks.pop();
        return nextTask.description;
    }

    int getTaskCount() {
        return tasks.size();
    }
};

EMSCRIPTEN_BINDINGS(todo_list) {
    emscripten::class_<TodoList>("TodoList")
        .constructor<>()
        .function("addTask", &TodoList::addTask)
        .function("getNextTask", &TodoList::getNextTask)
        .function("getTaskCount", &TodoList::getTaskCount);
}

// emcc to_do_list.cpp -o todo_list.js -s WASM=1 -s MODULARIZE=1 -s EXPORT_NAME="createModule" -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' -s ALLOW_MEMORY_GROWTH=1 -O3