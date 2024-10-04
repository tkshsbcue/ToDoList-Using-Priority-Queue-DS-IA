"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Trash2, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Todo {
  id: number
  text: string
  completed: boolean
  priority: "low" | "medium" | "high"
  dueDate: Date | null
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium")
  const [newDueDate, setNewDueDate] = useState<Date | null>(null)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")
  const [openCalendarId, setOpenCalendarId] = useState<number | null>(null)

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodo.trim() !== "") {
      setTodos([...todos, { 
        id: Date.now(), 
        text: newTodo, 
        completed: false, 
        priority: newPriority, 
        dueDate: newDueDate 
      }])
      setNewTodo("")
      setNewPriority("medium")
      setNewDueDate(null)
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map((todo) => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const removeTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const updatePriority = (id: number, priority: "low" | "medium" | "high") => {
    setTodos(todos.map((todo) => 
      todo.id === id ? { ...todo, priority } : todo
    ))
  }

  const updateDueDate = (id: number, date: Date | null) => {
    setTodos(todos.map((todo) => 
      todo.id === id ? { ...todo, dueDate: date } : todo
    ))
    setOpenCalendarId(null)
  }

  const getPriorityColor = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "low": return "bg-green-100 text-green-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "high": return "bg-red-100 text-red-800"
      default: return ""
    }
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === "active") return !todo.completed
    if (filter === "completed") return todo.completed
    return true
  })

  const sortedTodos = filteredTodos.sort((a, b) => {
    if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime()
    if (a.dueDate) return -1
    if (b.dueDate) return 1
    return 0
  })

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed))
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">To-Do List</h1>
      
      <form onSubmit={addTodo} className="flex flex-col mb-4">
        <div className="flex mb-2">
          <Input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task"
            className="flex-grow mr-2"
          />
          <Button type="submit">Add</Button>
        </div>

        <div className="flex space-x-2">
          <Select value={newPriority} onValueChange={(value: "low" | "medium" | "high") => setNewPriority(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Popover open={openCalendarId === 0} onOpenChange={(open) => setOpenCalendarId(open ? 0 : null)}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !newDueDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newDueDate ? format(newDueDate, "PPP") : <span>Pick a due date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar 
                mode="single" 
                selected={newDueDate ?? undefined} 
                onSelect={(date) => {
                  setNewDueDate(date ?? null)
                  setOpenCalendarId(null)
                }} 
                initialFocus 
                className="custom-calendar"
              />
            </PopoverContent>
          </Popover>
        </div>
      </form>

      <div className="flex justify-between mb-4">
        <Select value={filter} onValueChange={(value: "all" | "active" | "completed") => setFilter(value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={clearCompleted}>
          Clear Completed
        </Button>
      </div>

      {sortedTodos.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tasks found. Add a new task to get started!
          </AlertDescription>
        </Alert>
      )}

      <ul className="space-y-2">
        {sortedTodos.map((todo) => (
          <li key={todo.id} className="flex items-center justify-between p-2 border rounded">
            <div className="flex items-center flex-grow">
              <Checkbox
                id={`todo-${todo.id}`}
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id)}
                className="mr-2"
              />
              <label
                htmlFor={`todo-${todo.id}`}
                className={`flex-grow ${todo.completed ? "line-through text-gray-500" : ""} mr-2`}
              >
                {todo.text}
              </label>

              <Select value={todo.priority} onValueChange={(value: "low" | "medium" | "high") => updatePriority(todo.id, value)}>
                <SelectTrigger className={`w-24 ${getPriorityColor(todo.priority)}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Popover open={openCalendarId === todo.id} onOpenChange={(open) => setOpenCalendarId(open ? todo.id : null)}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-[180px] justify-start text-left font-normal", !todo.dueDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {todo.dueDate ? format(todo.dueDate, "PPP") : <span>Set due date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar 
                    mode="single" 
                    selected={todo.dueDate ?? undefined} 
                    onSelect={(date) => updateDueDate(todo.id, date)} 
                    initialFocus 
                    className="custom-calendar"
                  />
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="icon" onClick={() => removeTodo(todo.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}