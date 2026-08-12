package main

import (
	"encoding/json"
	"os"
	"sort"
	"sync"
)

// Store guarda as tarefas em memória e replica cada mudança pro arquivo JSON,
// assim os dados sobrevivem a um restart sem precisar de um banco de verdade.
type Store struct {
	mu    sync.RWMutex
	tasks map[string]Task
	path  string
}

func NewStore(path string) *Store {
	s := &Store{tasks: make(map[string]Task), path: path}
	s.load()
	return s
}

func (s *Store) load() {
	data, err := os.ReadFile(s.path)
	if err != nil {
		return
	}
	var list []Task
	if err := json.Unmarshal(data, &list); err != nil {
		return
	}
	for _, t := range list {
		s.tasks[t.ID] = t
	}
}

func (s *Store) persist() error {
	data, err := json.MarshalIndent(s.sortedLocked(), "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.path, data, 0644)
}

func (s *Store) sortedLocked() []Task {
	list := make([]Task, 0, len(s.tasks))
	for _, t := range s.tasks {
		list = append(list, t)
	}
	sort.Slice(list, func(i, j int) bool { return list[i].CreatedAt.Before(list[j].CreatedAt) })
	return list
}

func (s *Store) List() []Task {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.sortedLocked()
}

func (s *Store) Get(id string) (Task, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	t, ok := s.tasks[id]
	return t, ok
}

func (s *Store) Create(t Task) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.tasks[t.ID] = t
	return s.persist()
}

func (s *Store) Update(t Task) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.tasks[t.ID] = t
	return s.persist()
}

func (s *Store) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.tasks, id)
	return s.persist()
}
