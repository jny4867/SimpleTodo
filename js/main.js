document.getElementById("add-button").addEventListener("click", addTodo);
document.getElementById("clear-button").addEventListener("click", clearAllTodos);

// 입력 필드에서 엔터 키를 누를 때도 할 일을 등록
document.getElementById("todo-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        addTodo(); // 엔터 키를 누르면 addTodo 함수를 호출
    }
});

function addTodo() {
    const todoInput = document.getElementById("todo-input");
    const dateInput = document.getElementById("date-input");
    const todoText = todoInput.value.trim();
    const dueDate = dateInput.value;

    if (todoText !== "") {
        if (dueDate) {
            const todoListWithDeadline = document.getElementById("todo-list-with-deadline");
            const listItem = createListItem(todoText, dueDate);
            todoListWithDeadline.appendChild(listItem);
            sortTasksWithDeadline(); // 기한이 있는 리스트 정렬
        } else {
            // 기한이 없는 할 일
            const todoListWithoutDeadline = document.getElementById("todo-list-without-deadline");
            const listItem = createListItem(todoText, null);
            todoListWithoutDeadline.appendChild(listItem);
        }

        todoInput.value = "";
        dateInput.value = "";
        saveTodos();
    }
}

function createListItem(todoText, dueDate) {
    const listItem = document.createElement("li");
    listItem.setAttribute("draggable", "true");

    // 기한이 있는 리스트와 기한이 없는 리스트 모두 드래그 앤 드롭 이벤트를 처리
    listItem.addEventListener("dragstart", dragStart);
    listItem.addEventListener("dragover", dueDate ? dragOverForWithDeadline : dragOverForNoDeadline);
    listItem.addEventListener("drop", dropItem);
    listItem.addEventListener("dragend", dragEnd);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", toggleComplete);

    const span = document.createElement("span");
    span.textContent = todoText;
    span.addEventListener("dblclick", editTodo);

    listItem.appendChild(checkbox);
    listItem.appendChild(span);

    if (dueDate) {
        const dateSpan = document.createElement("span");
        dateSpan.textContent = dueDate;
        dateSpan.className = "due-date";
        listItem.appendChild(dateSpan);
    }

    return listItem;
}

function dragOverForWithDeadline(event) {
    event.preventDefault();
    const afterElement = getDragAfterElement(event.clientY, "#todo-list-with-deadline li:not(.dragging)");
    const todoList = document.getElementById("todo-list-with-deadline");
    if (afterElement == null) {
        todoList.appendChild(draggedItem);
    } else {
        todoList.insertBefore(draggedItem, afterElement);
    }
}

function toggleComplete(event) {
    const listItem = event.target.parentElement;
    if (event.target.checked) {
        listItem.classList.add("completed");
    } else {
        listItem.classList.remove("completed");
    }
}

//clear
function clearAllTodos() {
    const todoListWithDeadline = document.getElementById("todo-list-with-deadline");
    const todoListWithoutDeadline = document.getElementById("todo-list-without-deadline");
    todoListWithDeadline.innerHTML = ""; 
    todoListWithoutDeadline.innerHTML = ""; 
}

//sort
function sortTasksWithDeadline() {
    const todoListWithDeadline = document.getElementById("todo-list-with-deadline");
    const tasks = Array.from(todoListWithDeadline.querySelectorAll("li"));

    tasks.sort((a, b) => {
        const dateA = new Date(a.querySelector(".due-date").textContent);
        const dateB = new Date(b.querySelector(".due-date").textContent);
        return dateA - dateB;
    });

    tasks.forEach(task => todoListWithDeadline.appendChild(task));
}

//edit
function editTodo(event) {
    const span = event.target;
    const listItem = span.parentElement;

    const input = document.createElement("input");
    input.type = "text";
    input.value = span.textContent;
    input.className = "edit-input";

    listItem.replaceChild(input, span);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    input.addEventListener("blur", () => saveEdit(input, span));
    input.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            saveEdit(input, span);
        }
    });
}

function saveEdit(input, span) {
    const listItem = input.parentElement;
    span.textContent = input.value.trim();
    listItem.replaceChild(span, input);
}

// drag
let draggedItem = null;

function dragStart(event) {
    draggedItem = event.target;
    setTimeout(() => {
        event.target.classList.add("dragging");
    }, 0);
}

function dragEnd(event) {
    event.target.classList.remove("dragging");
    draggedItem = null;
}

function dragOverForNoDeadline(event) {
    event.preventDefault();
    const afterElement = getDragAfterElement(event.clientY, "#todo-list-without-deadline li:not(.dragging)");
    const todoList = document.getElementById("todo-list-without-deadline");
    if (afterElement == null) {
        todoList.appendChild(draggedItem);
    } else {
        todoList.insertBefore(draggedItem, afterElement);
    }
}

function dropItem(event) {
    event.preventDefault();
}

function getDragAfterElement(y, selector) {
    const draggableElements = [...document.querySelectorAll(selector)];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

document.getElementById("clear-button").addEventListener("dragover", (event) => {
    event.preventDefault();
});

document.getElementById("clear-button").addEventListener("drop", (event) => {
    if (draggedItem) {
        draggedItem.remove();
        draggedItem = null;
    }
});