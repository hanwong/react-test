import React, { useState } from "react";

export default () => {
  Category.use();
  return (
    <>
      <h1>Todos</h1>
      <CategoryView />
      <TodoView />
    </>
  );
};

//뷰
const CategoryView = () => {
  const { add, remove, select } = CategoryCommand;
  return (
    <nav>
      {[...Category.list].map((key) => (
        <div key={key}>
          <span onClick={select(key)}>{key}</span>
          <span onClick={remove(key)} STYLE="color:red">
            x
          </span>
        </div>
      ))}
      <input onKeyDown={add} placeholder="input new category" />
    </nav>
  );
};

const TodoView = () => {
  return <section>{TodoListRouter.use()}</section>;
};

//뷰컴포넌트
const TodoListView = ({
  command: {
    cat,
    keydown,
    remove,
    toggle,
    vm: { items },
  },
}) => (
  <>
    <h2>{cat}</h2>
    <input onKeyDown={keydown} />
    <ul>
      {[...items].map((item, i) => {
        const deco = item.isComplete ? "text-decoration:line-through" : "";
        return (
          <li key={i}>
            <span onClick={(_) => toggle(item)} STYLE={deco}>
              {item.title}
            </span>
            <span onClick={(_) => remove(item)}>x</span>
          </li>
        );
      })}
    </ul>
  </>
);

//뷰모델
class Category {
  static updater = 1;
  static setState;
  static use() {
    Category.setState = useState(Category.updater)[1];
  }
  static flush() {
    Category.setState((Category.updater *= -1));
  }
  static list = new Set();
  static add(v) {
    Category.list.add(v);
    Category.flush();
  }
  static remove(v) {
    Category.list.delete(v);
    Category.flush();
  }
  static _current = "";
  static get current() {
    return this._current;
  }
  static set current(v) {
    Category._current = v;
    Category.flush();
  }
}

class TodoList {
  items = new Set();
  add = (title) => {
    this.items.add({ title, isComplete: false });
    TodoListRouter.flush();
  };
  remove = (todo) => {
    this.items.delete(todo);
    TodoListRouter.flush();
  };
  toggle = (todo) => {
    todo.isComplete = !todo.isComplete;
    TodoListRouter.flush();
  };
}

//커맨드
class CategoryCommand {
  static selects = new Map();
  static removes = new Map();

  static add = ({ target, keyCode }) => {
    const input = target;
    if (!input.value.trim() || keyCode !== 13) return;
    Category.add(input.value.trim());
    input.value = "";
  };
  static select = (key) => {
    const { selects } = CategoryCommand;
    if (!selects.has(key)) selects.set(key, () => (Category.current = key));
    return selects.get(key);
  };
  static remove = (key) => {
    const { removes } = CategoryCommand;
    if (!removes.has(key)) removes.set(key, () => Category.remove(key));
    return removes.get(key);
  };
}

class TodoListCommand {
  cat = "";
  vm = new TodoList();
  constructor(cat) {
    this.cat = cat;
  }
  keydown = ({ target, keyCode }) => {
    const input = target;
    if (!input.value || keyCode !== 13) return;
    this.vm.add(input.value);
    input.value = "";
  };
  remove = (item) => this.vm.remove(item);
  toggle = (item) => this.vm.toggle(item);
  get view() {
    return <TodoListView command={this} />;
  }
}

//라우터
class TodoListRouter {
  static map = new Map();
  static update = 0;
  static setState;
  static flush() {
    TodoListRouter.setState(++TodoListRouter.update);
  }
  static use() {
    TodoListRouter.setState = useState(TodoListRouter.update)[1];
    const curr = Category.current;
    if (!curr) return <></>;
    const { map } = TodoListRouter;
    if (!map.has(curr)) map.set(curr, new TodoListCommand(curr));
    return map.get(curr).view;
  }
}
