import { FormEvent, ReactNode, useMemo, useRef, useState } from 'react'

type Category = string
type Filter = string
type Group = 'Personal' | 'Family'

type ShoppingItem = {
  id: number
  name: string
  detail: string
  categories: Category[]
  checked: boolean
}

const initialItems: ShoppingItem[] = [
  { id: 1, name: 'Avocados', detail: '2 ripe', categories: ['Produce'], checked: false },
  { id: 2, name: 'Oat milk', detail: '1 carton', categories: ['Dairy', 'Pantry'], checked: false },
  { id: 3, name: 'Sourdough bread', detail: '1 loaf', categories: ['Bakery'], checked: false },
  { id: 4, name: 'Cherry tomatoes', detail: '500 g', categories: ['Produce'], checked: true },
  { id: 5, name: 'Pasta', detail: '2 packs', categories: ['Pantry'], checked: true },
]

const familyItems: ShoppingItem[] = [
  { id: 101, name: 'Bananas', detail: '6 pieces', categories: ['Produce'], checked: false },
  { id: 102, name: 'Greek yogurt', detail: '2 tubs', categories: ['Dairy'], checked: false },
  { id: 103, name: 'Bagels', detail: '1 pack', categories: ['Bakery', 'Pantry'], checked: true },
  { id: 104, name: 'Breakfast cereal', detail: '1 box', categories: ['Pantry'], checked: false },
]

const initialCategories: Category[] = ['Produce', 'Dairy', 'Bakery', 'Pantry']

function Icon({
  children,
  size = 20,
  className = '',
}: {
  children: ReactNode
  size?: number
  className?: string
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {children}
    </svg>
  )
}

function App() {
  const [lists, setLists] = useState<Record<Group, ShoppingItem[]>>({
    Personal: initialItems,
    Family: familyItems,
  })
  const [activeGroup, setActiveGroup] = useState<Group>('Personal')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isClassWindowOpen, setIsClassWindowOpen] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [isAdding, setIsAdding] = useState(false)
  const [newItem, setNewItem] = useState('')
  const [newCategories, setNewCategories] = useState<Category[]>(['Produce'])
  const [editingClass, setEditingClass] = useState<Category | null>(null)
  const [editedClassName, setEditedClassName] = useState('')
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null)
  const [editedItemName, setEditedItemName] = useState('')
  const [editedItemDetail, setEditedItemDetail] = useState('')
  const [editedItemCategories, setEditedItemCategories] = useState<Category[]>([])
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ignoreNextClick = useRef(false)
  const filterDrag = useRef({ startX: 0, scrollLeft: 0, dragging: false })
  const items = lists[activeGroup]

  const setItems = (update: (current: ShoppingItem[]) => ShoppingItem[]) => {
    setLists((current) => ({ ...current, [activeGroup]: update(current[activeGroup]) }))
  }

  const visibleItems = useMemo(
    () => (filter === 'All' ? items : items.filter((item) => item.categories.includes(filter))),
    [filter, items],
  )
  const remaining = items.filter((item) => !item.checked).length
  const progress = items.length ? ((items.length - remaining) / items.length) * 100 : 0

  const toggleItem = (id: number) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    )
  }

  const addItem = (event: FormEvent) => {
    event.preventDefault()
    const name = newItem.trim()
    if (!name) return
    setItems((current) => [
      { id: Date.now(), name, detail: '1 item', categories: newCategories, checked: false },
      ...current,
    ])
    setNewItem('')
    setNewCategories([categories[0]])
    setIsAdding(false)
    setFilter('All')
  }

  const chooseGroup = (group: Group) => {
    setActiveGroup(group)
    setFilter('All')
    setIsAdding(false)
    setIsMenuOpen(false)
  }

  const addClass = (event: FormEvent) => {
    event.preventDefault()
    const className = newClassName.trim()
    if (!className) return
    const existingClass = categories.find(
      (category) => category.toLocaleLowerCase() === className.toLocaleLowerCase(),
    )
    if (existingClass) {
      setFilter(existingClass)
      setNewCategories((current) =>
        current.includes(existingClass) ? current : [...current, existingClass],
      )
    } else {
      setCategories((current) => [...current, className])
      setFilter(className)
      setNewCategories((current) => [...current, className])
    }
    setNewClassName('')
    setIsClassWindowOpen(false)
  }

  const startLongPress = (action: () => void) => {
    ignoreNextClick.current = false
    longPressTimer.current = setTimeout(() => {
      ignoreNextClick.current = true
      action()
    }, 550)
  }

  const cancelLongPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    longPressTimer.current = null
  }

  const consumeLongPressClick = () => {
    if (!ignoreNextClick.current) return false
    ignoreNextClick.current = false
    return true
  }

  const openClassEditor = (category: Category) => {
    setEditingClass(category)
    setEditedClassName(category)
  }

  const saveClass = (event: FormEvent) => {
    event.preventDefault()
    if (!editingClass) return
    const name = editedClassName.trim()
    const isDuplicate = categories.some(
      (category) =>
        category !== editingClass &&
        category.toLocaleLowerCase() === name.toLocaleLowerCase(),
    )
    if (!name || isDuplicate) return
    setCategories((current) =>
      current.map((category) => (category === editingClass ? name : category)),
    )
    setLists((current) => ({
      Personal: current.Personal.map((item) => ({
        ...item,
        categories: item.categories.map((category) => (category === editingClass ? name : category)),
      })),
      Family: current.Family.map((item) => ({
        ...item,
        categories: item.categories.map((category) => (category === editingClass ? name : category)),
      })),
    }))
    setNewCategories((current) =>
      current.map((category) => (category === editingClass ? name : category)),
    )
    if (filter === editingClass) setFilter(name)
    setEditingClass(null)
  }

  const removeClass = () => {
    if (!editingClass || categories.length === 1) return
    const fallback = categories.find((category) => category !== editingClass) as Category
    setCategories((current) => current.filter((category) => category !== editingClass))
    setLists((current) => ({
      Personal: current.Personal.map((item) => {
        const next = item.categories.filter((category) => category !== editingClass)
        return { ...item, categories: next.length ? next : [fallback] }
      }),
      Family: current.Family.map((item) => {
        const next = item.categories.filter((category) => category !== editingClass)
        return { ...item, categories: next.length ? next : [fallback] }
      }),
    }))
    setNewCategories((current) => {
      const next = current.filter((category) => category !== editingClass)
      return next.length ? next : [fallback]
    })
    if (filter === editingClass) setFilter('All')
    setEditingClass(null)
  }

  const openItemEditor = (item: ShoppingItem) => {
    setEditingItem(item)
    setEditedItemName(item.name)
    setEditedItemDetail(item.detail)
    setEditedItemCategories(item.categories)
  }

  const saveItem = (event: FormEvent) => {
    event.preventDefault()
    if (!editingItem || !editedItemName.trim()) return
    setItems((current) =>
      current.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              name: editedItemName.trim(),
              detail: editedItemDetail.trim() || '1 item',
              categories: editedItemCategories,
            }
          : item,
      ),
    )
    setEditingItem(null)
  }

  const removeEditingItem = () => {
    if (!editingItem) return
    setItems((current) => current.filter((item) => item.id !== editingItem.id))
    setEditingItem(null)
  }

  return (
    <main className="app-shell">
      <section className="phone" aria-label="Shopping list app">
        <button
          aria-label="Close group menu"
          className={`menu-scrim ${isMenuOpen ? 'visible' : ''}`}
          onClick={() => setIsMenuOpen(false)}
          tabIndex={isMenuOpen ? 0 : -1}
        />
        <aside className={`side-menu ${isMenuOpen ? 'open' : ''}`} aria-hidden={!isMenuOpen}>
          <div className="side-menu-header">
            <div className="menu-mark">
              <Icon size={23}>
                <path d="M5.5 8.5h13l-1 11h-11l-1-11Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
                <path d="M9 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
              </Icon>
            </div>
            <div>
              <span>SHOPPING SPACE</span>
              <h2>Choose a group</h2>
            </div>
          </div>

          <div className="group-list">
            {(['Personal', 'Family'] as Group[]).map((group) => (
              <button
                className={`group-option ${activeGroup === group ? 'selected' : ''}`}
                key={group}
                onClick={() => chooseGroup(group)}
              >
                <span className="group-icon">
                  {group === 'Personal' ? (
                    <Icon size={20}>
                      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
                      <path d="M5.5 19c.6-4 2.8-6 6.5-6s5.9 2 6.5 6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
                    </Icon>
                  ) : (
                    <Icon size={21}>
                      <circle cx="9" cy="8" r="2.7" stroke="currentColor" strokeWidth="1.6" />
                      <circle cx="16.5" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M3.8 18c.5-3.5 2.3-5.2 5.2-5.2s4.7 1.7 5.2 5.2M14 13.8c3.3-.6 5.4.8 6.2 4.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
                    </Icon>
                  )}
                </span>
                <span className="group-copy">
                  <strong>{group}</strong>
                  <small>{group === 'Personal' ? 'Only visible to you' : 'Shared with 3 people'}</small>
                </span>
                {activeGroup === group && (
                  <span className="selected-check">
                    <Icon size={15}>
                      <path d="m5 12 4 4L19 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
                    </Icon>
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="menu-note">
            <Icon size={17}>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            </Icon>
            <span>Items added here stay in the selected group.</span>
          </div>
        </aside>

        {isClassWindowOpen && (
          <div className="class-window-layer" role="presentation">
            <button
              aria-label="Close add class window"
              className="class-window-scrim"
              onClick={() => setIsClassWindowOpen(false)}
            />
            <form className="class-window" onSubmit={addClass}>
              <div className="class-window-icon">
                <Icon size={22}>
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                </Icon>
              </div>
              <span className="class-window-label">NEW PRODUCT CLASS</span>
              <h2>Add a new class</h2>
              <p>Create a category to keep your shopping list easy to browse.</p>
              <label htmlFor="class-name">Class name</label>
              <input
                autoFocus
                id="class-name"
                maxLength={24}
                onChange={(event) => setNewClassName(event.target.value)}
                placeholder="e.g. Frozen foods"
                value={newClassName}
              />
              <div className="class-window-actions">
                <button type="button" onClick={() => setIsClassWindowOpen(false)}>Cancel</button>
                <button className="save-class-button" disabled={!newClassName.trim()} type="submit">
                  Add class
                </button>
              </div>
            </form>
          </div>
        )}

        {editingClass && (
          <div className="class-window-layer" role="presentation">
            <button
              aria-label="Close class editor"
              className="class-window-scrim"
              onClick={() => setEditingClass(null)}
            />
            <form className="class-window" onSubmit={saveClass}>
              <div className="class-window-icon">
                <Icon size={21}>
                  <path d="M4 20h4l10.5-10.5a2.8 2.8 0 0 0-4-4L4 16v4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
                  <path d="m13 7 4 4" stroke="currentColor" strokeWidth="1.7" />
                </Icon>
              </div>
              <span className="class-window-label">EDIT PRODUCT CLASS</span>
              <h2>Edit class</h2>
              <p>Rename this class or remove it from your shopping lists.</p>
              <label htmlFor="edit-class-name">Class name</label>
              <input
                autoFocus
                id="edit-class-name"
                maxLength={24}
                onChange={(event) => setEditedClassName(event.target.value)}
                value={editedClassName}
              />
              <div className="edit-window-actions">
                <button
                  className="danger-button"
                  disabled={categories.length === 1}
                  onClick={removeClass}
                  type="button"
                >
                  Remove
                </button>
                <button type="button" onClick={() => setEditingClass(null)}>Cancel</button>
                <button className="save-class-button" disabled={!editedClassName.trim()} type="submit">
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        {editingItem && (
          <div className="class-window-layer" role="presentation">
            <button
              aria-label="Close item editor"
              className="class-window-scrim"
              onClick={() => setEditingItem(null)}
            />
            <form className="class-window item-editor" onSubmit={saveItem}>
              <div className="class-window-icon">
                <Icon size={21}>
                  <path d="M4 20h4l10.5-10.5a2.8 2.8 0 0 0-4-4L4 16v4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
                  <path d="m13 7 4 4" stroke="currentColor" strokeWidth="1.7" />
                </Icon>
              </div>
              <span className="class-window-label">EDIT SHOPPING ITEM</span>
              <h2>Edit item</h2>
              <label htmlFor="edit-item-name">Item name</label>
              <input
                autoFocus
                id="edit-item-name"
                maxLength={40}
                onChange={(event) => setEditedItemName(event.target.value)}
                value={editedItemName}
              />
              <label htmlFor="edit-item-detail">Quantity or note</label>
              <input
                id="edit-item-detail"
                maxLength={30}
                onChange={(event) => setEditedItemDetail(event.target.value)}
                value={editedItemDetail}
              />
              <label>Product classes</label>
              <div className="category-select edit-category-select">
                {categories.map((category) => (
                  <button
                    aria-pressed={editedItemCategories.includes(category)}
                    className={editedItemCategories.includes(category) ? 'selected' : ''}
                    key={category}
                    onClick={() =>
                      setEditedItemCategories((current) =>
                        current.includes(category)
                          ? current.length === 1
                            ? current
                            : current.filter((entry) => entry !== category)
                          : [...current, category],
                      )
                    }
                    type="button"
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="edit-window-actions">
                <button className="danger-button" onClick={removeEditingItem} type="button">
                  Remove
                </button>
                <button type="button" onClick={() => setEditingItem(null)}>Cancel</button>
                <button className="save-class-button" disabled={!editedItemName.trim()} type="submit">
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        <header className="topbar">
          <button
            aria-expanded={isMenuOpen}
            aria-label="Choose shopping group"
            className="icon-button"
            onClick={() => setIsMenuOpen(true)}
          >
            <Icon size={22}>
              <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            </Icon>
          </button>
          <span className="eyebrow">{activeGroup.toUpperCase()} LIST</span>
          <button className="avatar" aria-label="Open profile">M</button>
        </header>

        <div className="content">
          <div className="title-row">
            <div>
              <p className="date-label">SATURDAY, 24 MAY</p>
              <h1>Weekly groceries</h1>
            </div>
            <button className="more-button" aria-label="List options">
              <Icon size={22}>
                <circle cx="5" cy="12" r="1.4" fill="currentColor" />
                <circle cx="12" cy="12" r="1.4" fill="currentColor" />
                <circle cx="19" cy="12" r="1.4" fill="currentColor" />
              </Icon>
            </button>
          </div>

          <section
            className="progress-card"
            aria-label={remaining === 0 ? 'Shopping complete' : `${remaining} items left`}
            style={{ height: 96 }}
          >
            {remaining === 0 ? (
              <div className="progress-copy" style={{ position: 'sticky' }}>
                <div className="bag-icon">
                  <Icon size={25}>
                    <path d="m5 12 4 4L19 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </Icon>
                </div>
                <div>
                  <strong>You’re all done!</strong>
                  <span>There’s nothing else to buy 🎉💜</span>
                </div>
              </div>
            ) : (
              <>
                <div className="progress-copy" style={{ justifyContent: 'flex-start' }}>
                  <div className="bag-icon">
                    <Icon size={25}>
                      <path d="M5.5 8.5h13l-1 11h-11l-1-11Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
                      <path d="M9 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
                    </Icon>
                  </div>
                  <div>
                    <strong>{remaining} items left</strong>
                    <span>{items.length - remaining} of {items.length} in your basket</span>
                  </div>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${progress}%` }} />
                </div>
              </>
            )}
          </section>

          <nav
            className="filters"
            aria-label="Filter groceries"
            onPointerDown={(event) => {
              if (event.pointerType !== 'mouse') return
              filterDrag.current = {
                startX: event.clientX,
                scrollLeft: event.currentTarget.scrollLeft,
                dragging: false,
              }
            }}
            onPointerMove={(event) => {
              if (event.pointerType !== 'mouse' || event.buttons !== 1) return
              const distance = event.clientX - filterDrag.current.startX
              if (Math.abs(distance) > 4) {
                filterDrag.current.dragging = true
                ignoreNextClick.current = true
                cancelLongPress()
                event.currentTarget.scrollLeft = filterDrag.current.scrollLeft - distance
              }
            }}
            onPointerUp={() => {
              filterDrag.current.dragging = false
            }}
          >
            {(['All', ...categories] as Filter[]).map((category) => (
              <button
                className={filter === category ? 'active' : ''}
                key={category}
                onClick={() => {
                  if (!consumeLongPressClick()) setFilter(category)
                }}
                onContextMenu={(event) => {
                  if (category === 'All') return
                  event.preventDefault()
                  openClassEditor(category)
                }}
                onPointerCancel={cancelLongPress}
                onPointerDown={() => {
                  if (category !== 'All') startLongPress(() => openClassEditor(category))
                }}
                onPointerMove={cancelLongPress}
                onPointerUp={cancelLongPress}
              >
                {category}
              </button>
            ))}
            <button
              aria-label="Add a new product class"
              className="add-filter-button"
              onClick={() => {
                if (!consumeLongPressClick()) setIsClassWindowOpen(true)
              }}
            >
              <Icon size={14}>
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
              </Icon>
              New
            </button>
          </nav>

          <div className="section-heading">
            <h2>{filter === 'All' ? 'Your items' : filter}</h2>
            <span>{visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}</span>
          </div>

          <div className="items-list">
            {visibleItems.map((item) => (
              <article
                className={`item ${item.checked ? 'completed' : ''}`}
                key={item.id}
                onContextMenu={(event) => {
                  event.preventDefault()
                  openItemEditor(item)
                }}
                onPointerCancel={cancelLongPress}
                onPointerDown={() => startLongPress(() => openItemEditor(item))}
                onPointerMove={cancelLongPress}
                onPointerUp={cancelLongPress}
              >
                <button
                  aria-label={`${item.checked ? 'Uncheck' : 'Check'} ${item.name}`}
                  className="check-button"
                  onClick={() => {
                    if (!consumeLongPressClick()) toggleItem(item.id)
                  }}
                >
                  {item.checked && (
                    <Icon size={15}>
                      <path d="m5 12 4 4L19 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
                    </Icon>
                  )}
                </button>
                <button
                  className="item-copy"
                  onClick={() => {
                    if (!consumeLongPressClick()) toggleItem(item.id)
                  }}
                >
                  <strong>{item.name}</strong>
                  <span>{item.detail} · {item.categories.join(', ')}</span>
                </button>
                <button
                  aria-label={`Remove ${item.name}`}
                  className="remove-button"
                  onClick={() => {
                    if (!consumeLongPressClick()) {
                      setItems((current) => current.filter((entry) => entry.id !== item.id))
                    }
                  }}
                >
                  <Icon size={19}>
                    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                  </Icon>
                </button>
              </article>
            ))}
            {visibleItems.length === 0 && (
              <div className="empty-state">
                <div className="empty-check">
                  <Icon size={25}>
                    <path d="m5 12 4 4L19 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </Icon>
                </div>
                <strong>Nothing here yet</strong>
                <span>Add an item or try another category.</span>
              </div>
            )}
          </div>
        </div>

        <div className="bottom-area">
          {isAdding && (
            <form className="add-panel" onSubmit={addItem}>
              <div className="input-wrap">
                <input
                  autoFocus
                  onChange={(event) => setNewItem(event.target.value)}
                  placeholder="What do you need?"
                  value={newItem}
                />
                <button type="submit" aria-label="Save item">
                  <Icon size={18}>
                    <path d="m5 12 4 4L19 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
                  </Icon>
                </button>
              </div>
              <div className="category-select">
                {categories.map((category) => (
                  <button
                    aria-pressed={newCategories.includes(category)}
                    className={newCategories.includes(category) ? 'selected' : ''}
                    key={category}
                    onClick={() =>
                      setNewCategories((current) =>
                        current.includes(category)
                          ? current.length === 1
                            ? current
                            : current.filter((entry) => entry !== category)
                          : [...current, category],
                      )
                    }
                    type="button"
                  >
                    {category}
                  </button>
                ))}
              </div>
              <span className="selection-hint">
                Select one or more classes
              </span>
            </form>
          )}
          <button className="add-button" onClick={() => setIsAdding((open) => !open)}>
            <Icon className={isAdding ? 'rotated' : ''} size={20}>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </Icon>
            {isAdding ? 'Close' : 'Add new item'}
          </button>
          <div className="home-indicator" />
        </div>
      </section>
    </main>
  )
}

export default App
