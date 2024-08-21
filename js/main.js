// PaceMaker: 간단한 일정 관리 웹 어플리케이션
// 20240821 - 마지막 수정
// 작성자: 전나영

document.getElementById("add-button").addEventListener("click", addTodo);
document.getElementById("clear-button").addEventListener("click",clearAllTodos);
document
  .getElementById("todo-input")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      addTodo(); // 엔터 키를 누르면 addTodo 함수 호출
    }
  });

// 할 일을 추가하는 함수
function addTodo() {
  const todoInput = document.getElementById("todo-input"); // 할 일 입력 필드
  const dateInput = document.getElementById("date-input"); // 기한 입력 필드
  const todoText = todoInput.value.trim(); // 입력된 텍스트의 앞뒤 공백 제거
  const dueDate = dateInput.value; // 입력된 기한

  // 할 일이 비어 있지 않은 경우에만 추가
  if (todoText !== "") {
    if (dueDate) {
      // 기한이 있는 할 일 추가
      const todoListWithDeadline = document.getElementById(
        "todo-list-with-deadline"
      );
      const listItem = createListItem(todoText, dueDate);
      todoListWithDeadline.appendChild(listItem);
      sortTasksWithDeadline(); // 기한이 있는 리스트를 날짜 순으로 정렬
    } else {
      // 기한이 없는 할 일을 추가
      const todoListWithoutDeadline = document.getElementById(
        "todo-list-without-deadline"
      );
      const listItem = createListItem(todoText, null);
      todoListWithoutDeadline.appendChild(listItem);
    }

    // 입력 필드 초기화
    todoInput.value = "";
    dateInput.value = "";
    saveTodos(); // 할 일 목록을 저장
  }
}

function createListItem(todoText, dueDate) {
  const listItem = document.createElement("li");
  listItem.setAttribute("draggable", "true");

  listItem.addEventListener("dragstart", dragStart);
  listItem.addEventListener("dragover", (event) => {
    const listId = dueDate
      ? "#todo-list-with-deadline"
      : "#todo-list-without-deadline";
    dragOver(event, listId);
  });
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

// 체크박스를 통해 할 일의 완료 상태를 토글
function toggleComplete(event) {
  const listItem = event.target.parentElement; // 체크박스의 부모 요소인 리스트 항목
  if (event.target.checked) {
    listItem.classList.add("completed"); // 완료된 항목에 취소선 추가
  } else {
    listItem.classList.remove("completed"); // 완료 상태 해제
  }
}

// 모든 할 일 목록 삭제
function clearAllTodos() {
  const todoListWithDeadline = document.getElementById(
    "todo-list-with-deadline"
  );
  const todoListWithoutDeadline = document.getElementById(
    "todo-list-without-deadline"
  );
  todoListWithDeadline.innerHTML = ""; // 기한이 있는 목록을 비우기
  todoListWithoutDeadline.innerHTML = ""; // 기한이 없는 목록을 비우기
}

// 기한이 있는 할 일 날짜 순으로 정렬
function sortTasksWithDeadline() {
  const todoListWithDeadline = document.getElementById(
    "todo-list-with-deadline"
  );
  const tasks = Array.from(todoListWithDeadline.querySelectorAll("li"));

  tasks.sort((a, b) => {
    const dateA = new Date(a.querySelector(".due-date").textContent);
    const dateB = new Date(b.querySelector(".due-date").textContent);
    return dateA - dateB;
  });

  tasks.forEach((task) => todoListWithDeadline.appendChild(task)); // 정렬된 순서로 다시 추가
}

// 할 일 텍스트 수정
function editTodo(event) {
  const span = event.target; // 클릭한 텍스트(span) 요소
  const listItem = span.parentElement; // 해당 텍스트가 포함된 리스트 항목

  // 수정할 수 있는 입력 필드 생성
  const input = document.createElement("input");
  input.type = "text";
  input.value = span.textContent;
  input.className = "edit-input"; // 스타일을 적용하기 위해 클래스 설정

  listItem.replaceChild(input, span); // 텍스트를 입력 필드로 교체
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length); // 커서를 텍스트 끝으로 이동

  // 입력 필드에서 포커스가 벗어나거나 엔터키를 누르면 수정 내용 저장
  input.addEventListener("blur", () => saveEdit(input, span));
  input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      saveEdit(input, span);
    }
  });
}

// 수정된 내용을 저장
function saveEdit(input, span) {
  const listItem = input.parentElement;
  span.textContent = input.value.trim(); // 입력된 텍스트 저장
  listItem.replaceChild(span, input); // 입력 필드를 다시 텍스트로 교체
}

// 드래그 앤 드롭 기능을 위한 전역 변수
let draggedItem = null;

// 드래그가 시작될 때 실행
function dragStart(event) {
  draggedItem = event.target; // 드래그 중인 항목 저장
  setTimeout(() => {
    event.target.classList.add("dragging"); // 드래그 중인 항목 반투명하게 표시
  }, 0);
}

// 드래그가 끝날 때 실행
function dragEnd(event) {
  event.target.classList.remove("dragging"); // 반투명 상태 해제
  draggedItem = null; // 드래그 중인 항목 초기화
}

// 드래그 중인 항목이 리스트 내에서 이동할 때 호출
function dragOver(event, listId) {
    event.preventDefault();
    const afterElement = getDragAfterElement(
      event.clientY, //현재 마우스의 Y 좌표
      `${listId} li:not(.dragging)` // 어느 리스트에서 드래그 앤 드롭을 수행할 것인가 + 드래그 중이 아닌 모든 리스트 항목을 선택
    );
  
    // 드래그 중인 항목이 추가될 리스트
    const todoList = document.querySelector(listId);

    if (afterElement == null) {
      // 리스트의 끝에 항목 추가
      todoList.appendChild(draggedItem);
    } else {
      // 드래그된 항목을 계산된 위치에 삽입
      todoList.insertBefore(draggedItem, afterElement);
    }
  }

// 드래그된 항목을 드롭할 때
function dropItem(event) {
  event.preventDefault(); // 기본 동작을 막아 드래그된 항목이 위치를 변경할 수 있게 함
}

// 드래그된 항목이 놓일 위치를 계산
function getDragAfterElement(y, selector) {
  const draggableElements = [...document.querySelectorAll(selector)];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child }; // 가장 가까운 위치를 계산하여 반환
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

// 휴지통 아이콘 위로 항목을 드래그할 때 실행
document
  .getElementById("clear-button")
  .addEventListener("dragover", (event) => {
    event.preventDefault(); // 기본 동작을 막아서 드래그된 항목이 삭제되게 함
  });

// 휴지통 아이콘에 항목을 드롭할 때 실행
document.getElementById("clear-button").addEventListener("drop", (event) => {
  if (draggedItem) {
    draggedItem.remove(); // 드래그된 항목 삭제
    draggedItem = null; // 드래그 중인 항목 초기화
  }
});
