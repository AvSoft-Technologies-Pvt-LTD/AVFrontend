import { useState, useEffect } from 'react';
import { predefinedTemplates } from '../data/templateData';

export const useTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load templates (in real app, this would be an API call)
    setTemplates(predefinedTemplates);
    setFilteredTemplates(predefinedTemplates);
  }, []);

  useEffect(() => {
    let filtered = templates;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => 
        template.category === selectedCategory
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTemplates(filtered);
  }, [selectedCategory, searchTerm, templates]);

  const getTemplateById = (id) => {
    return templates.find(template => template.id === parseInt(id));
  };

  return {
    templates: filteredTemplates,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    getTemplateById
  };
};