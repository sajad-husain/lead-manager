# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# useMemo & useCallback Learning Guide

## Table of Contents
1. [Understanding React Re-renders](#understanding-react-re-renders)
2. [useMemo Hook](#usememohook)
3. [useCallback Hook](#usecallbackhook)
4. [Advanced Examples](#advanced-examples)
5. [Performance Testing](#performance-testing)
6. [Common Mistakes](#common-mistakes)
7. [Best Practices](#best-practices)

## Understanding React Re-renders

Before diving into useMemo and useCallback, understand that React components re-render when:
- Props change
- State changes
- Parent component re-renders
- Context changes

Unnecessary re-renders can cause performance issues, especially with expensive calculations.

## useMemo Hook

### Beginner Level - Basic Caching

```jsx
import { useMemo } from 'react';

function ExpensiveCalculation({ num }) {
  const expensiveValue = useMemo(() => {
    console.log('Running expensive calculation...');
    return num * 1000000;
  }, [num]);

  return <div>Result: {expensiveValue}</div>;
}
```

### Intermediate Level - Complex Objects

```jsx
import { useMemo } from 'react';

function UserList({ users, filter }) {
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [users, filter]);

  const userStats = useMemo(() => {
    return {
      total: filteredUsers.length,
      active: filteredUsers.filter(u => u.active).length
    };
  }, [filteredUsers]);

  return (
    <div>
      <p>Active: {userStats.active}/{userStats.total}</p>
      {filteredUsers.map(user => <div key={user.id}>{user.name}</div>)}
    </div>
  );
}
```

### Advanced Level - Memoized Components with Dependencies

```jsx
import { useMemo } from 'react';

function DataTable({ data, sortBy, sortOrder, columns }) {
  const sortedData = useMemo(() => {
    if (!data) return [];
    
    return [...data].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [data, sortBy, sortOrder]);

  const processedColumns = useMemo(() => {
    return columns.map(col => ({
      ...col,
      computedWidth: col.width || 'auto',
      isSortable: col.sortable !== false
    }));
  }, [columns]);

  const memoizedRows = useMemo(() => {
    return sortedData.map((row, index) => ({
      ...row,
      computedId: row.id || `row-${index}`,
      rowNumber: index + 1
    }));
  }, [sortedData]);

  return (
    <table>
      <thead>
        <tr>
          {processedColumns.map(col => (
            <th key={col.key}>{col.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {memoizedRows.map(row => (
          <tr key={row.computedId}>
            {processedColumns.map(col => (
              <td key={col.key}>{row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## useCallback Hook

### Beginner Level - Basic Function Memoization

```jsx
import { useCallback } from 'react';

function Counter({ onIncrement }) {
  const handleClick = useCallback(() => {
    onIncrement(1);
  }, [onIncrement]);

  return <button onClick={handleClick}>Increment</button>;
}
```

### Intermediate Level - Event Handlers with Parameters

```jsx
import { useCallback } from 'react';

function TodoItem({ todo, onUpdate, onDelete }) {
  const handleToggle = useCallback(() => {
    onUpdate(todo.id, { ...todo, completed: !todo.completed });
  }, [todo.id, onUpdate]);

  const handleDelete = useCallback(() => {
    onDelete(todo.id);
  }, [todo.id, onDelete]);

  const handleEdit = useCallback((newValue) => {
    onUpdate(todo.id, { ...todo, text: newValue });
  }, [todo.id, onUpdate]);

  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
      />
      <span>{todo.text}</span>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
```

### Advanced Level - Debounced Callbacks with Complex Logic

```jsx
import { useCallback, useRef, useEffect } from 'react';

function useDebouncedCallback(callback, delay) {
  const timeoutRef = useRef();

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedCallback]);

  return debouncedCallback;
}

function SearchInput({ onSearch, minSearchLength = 3 }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const debouncedSearch = useDebouncedCallback((term) => {
    if (term.length >= minSearchLength) {
      onSearch(term);
    }
  }, 300);

  const handleInputChange = useCallback((event) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleClear = useCallback(() => {
    setSearchTerm('');
    onSearch('');
  }, [onSearch]);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder="Search..."
      />
      {searchTerm && (
        <button onClick={handleClear}>Clear</button>
      )}
    </div>
  );
}
```

## Advanced Examples

### Combining useMemo and useCallback

```jsx
import { useMemo, useCallback } from 'react';

function usePaginatedData(data, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.ceil(data.length / itemsPerPage);
  }, [data.length, itemsPerPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage
  };
}

function DataTable({ data, columns }) {
  const {
    currentPage,
    totalPages,
    paginatedData,
    nextPage,
    prevPage,
    goToPage
  } = usePaginatedData(data);

  const renderPagination = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          disabled={i === currentPage}
        >
          {i}
        </button>
      );
    }
    return pages;
  }, [totalPages, currentPage, goToPage]);

  return (
    <div>
      <table>
        {/* Table content */}
      </table>
      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </button>
        {renderPagination}
        <button onClick={nextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
```

### Performance-optimized Form Handler

```jsx
import { useCallback, useMemo } from 'react';

function useFormValidation(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return '';
  }, [validationRules]);

  const validateAllFields = useCallback(() => {
    const newErrors = {};
    Object.keys(values).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) newErrors[name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validateField]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  const handleSubmit = useCallback((onSubmit) => {
    return (event) => {
      event.preventDefault();
      setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      
      if (validateAllFields()) {
        onSubmit(values);
      }
    };
  }, [values, validateAllFields]);

  const isFormValid = useMemo(() => {
    return Object.keys(errors).every(key => !errors[key]) &&
           Object.keys(values).length === Object.keys(validationRules).length;
  }, [errors, values, validationRules]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isFormValid
  };
}
```

## Performance Testing

### Testing useMemo Performance

```jsx
import { useMemo, useState, useEffect } from 'react';

function PerformanceTest() {
  const [count, setCount] = useState(1);
  const [useMemoEnabled, setUseMemoEnabled] = useState(true);

  const expensiveCalculation = (num) => {
    console.log('Running expensive calculation...');
    let result = 0;
    for (let i = 0; i < num * 1000000; i++) {
      result += Math.sqrt(i);
    }
    return result;
  };

  const memoizedResult = useMemo(
    () => expensiveCalculation(count),
    useMemoEnabled ? [count] : [count, Math.random()] // Force re-calc when disabled
  );

  const nonMemoizedResult = expensiveCalculation(count);

  return (
    <div>
      <h2>Performance Test</h2>
      <p>Count: {count}</p>
      <p>Memoized: {memoizedResult}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setUseMemoEnabled(!useMemoEnabled)}>
        Toggle useMemo: {useMemoEnabled ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}
```

### Testing useCallback with React.memo

```jsx
import { useCallback, useState } from 'react';
import { memo } from 'react';

const ExpensiveChild = memo(function ExpensiveChild({ onClick, label }) {
  console.log(`Rendering ${label}`);
  
  // Simulate expensive rendering
  const items = Array.from({ length: 1000 }, (_, i) => `Item ${i}`);
  
  return (
    <div>
      <h3>{label}</h3>
      <button onClick={onClick}>Click me</button>
      <ul>
        {items.slice(0, 5).map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
});

function CallbackTest() {
  const [count, setCount] = useState(0);
  const [useCallbackEnabled, setUseCallbackEnabled] = useState(true);

  const handleClickWithCallback = useCallback(() => {
    console.log('Callback clicked');
  }, []);

  const handleClickWithoutCallback = () => {
    console.log('Regular click');
  };

  return (
    <div>
      <h2>useCallback Test</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment Parent</button>
      
      <ExpensiveChild
        label="With useCallback"
        onClick={useCallbackEnabled ? handleClickWithCallback : handleClickWithoutCallback}
      />
      
      <button onClick={() => setUseCallbackEnabled(!useCallbackEnabled)}>
        Toggle useCallback: {useCallbackEnabled ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}
```

## Common Mistakes

### 1. Overusing useMemo/useState

```jsx
// ❌ Bad - Don't memoize simple operations
const doubled = useMemo(() => count * 2, [count]);

// ✅ Good - Simple operations don't need memoization
const doubled = count * 2;
```

### 2. Missing Dependencies

```jsx
// ❌ Bad - Missing dependency
const filteredData = useMemo(() => 
  data.filter(item => item.status === filterStatus),
  [data] // Missing filterStatus
);

// ✅ Good - All dependencies included
const filteredData = useMemo(() => 
  data.filter(item => item.status === filterStatus),
  [data, filterStatus]
);
```

### 3. Creating New Objects in Dependencies

```jsx
// ❌ Bad - Creates new object each render
const memoizedValue = useMemo(() => 
  processData(data, { option1: true, option2: false }),
  [data, { option1: true, option2: false }] // New object each time
);

// ✅ Good - Stable object
const options = useMemo(() => ({ 
  option1: true, 
  option2: false 
}), []);

const memoizedValue = useMemo(() => 
  processData(data, options),
  [data, options]
);
```

## Best Practices

### When to Use useMemo
- Expensive calculations (API data processing, complex sorting, large array operations)
- Creating stable references for objects passed to memoized components
- Caching derived data that doesn't change often

### When to Use useCallback
- Passing functions to memoized child components
- Event handlers that depend on props or state
- Functions used as dependencies in other hooks

### Performance Rules
1. **Profile first**: Don't optimize prematurely
2. **Measure impact**: Use React DevTools to identify re-renders
3. **Keep dependencies minimal**: Only include what's necessary
4. **Consider complexity**: Simple operations don't need memoization

### Code Structure Tips

```jsx
// ✅ Good - Group related memoizations
const memoizedValues = useMemo(() => {
  const processed = processRawData(rawData);
  const filtered = processed.filter(item => item.active);
  const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));
  
  return { processed, filtered, sorted };
}, [rawData]);

// ✅ Good - Extract complex callbacks to custom hooks
const useApiHandlers = (apiUrl) => {
  const fetchData = useCallback(async () => {
    const response = await fetch(apiUrl);
    return response.json();
  }, [apiUrl]);

  return { fetchData };
};
```

This comprehensive guide covers useMemo and useCallback from basic concepts to advanced patterns, helping you understand when and how to use these hooks effectively for React performance optimization.
