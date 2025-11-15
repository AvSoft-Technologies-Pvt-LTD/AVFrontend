import React, { useState, useEffect } from 'react';
import { 
  X, 
  Palette, 
  Search, 
  Grid,
  Star,
  Clock,
  Check,
  Eye,
  Play,
  ChevronDown
} from 'lucide-react';

// Import components and hooks
import TemplateCard from './TemplateCard';
import TemplatePreview from './TemplatePreview';
import ColorPicker from './ColorPicker';
import { useTemplates } from './hooks/useTemplates';
import { useColor } from './hooks/useColor';
import { usePreview } from './hooks/usePreview';
import { templateCategories, defaultUserData } from './data/templateData';

const TemplateModal = ({ 
  isOpen, 
  onClose, 
  onSelectTemplate, 
  selectedTemplate,
  userData: propUserData,
  patientData 
}) => {
  // State management
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [recentTemplates, setRecentTemplates] = useState([]);
  const [favoriteTemplates, setFavoriteTemplates] = useState([]);

  // Custom hooks
  const {
    templates,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    loading
  } = useTemplates();

  const {
    selectedColor,
    handleColorChange
  } = useColor();

  const {
    previewData,
    isPreviewVisible,
    generatePreview,
    closePreview,
    downloadPreview,
    isGenerating
  } = usePreview();

  // Merge user data with defaults
  const userData = {
    ...defaultUserData,
    ...propUserData,
    patientName: patientData?.fullName || 'Patient Name',
    age: patientData?.age || 'Age',
    gender: patientData?.gender || 'Gender',
    contact: patientData?.contact || 'Contact Information'
  };

  // Load recent templates from localStorage
  useEffect(() => {
    const savedRecent = localStorage.getItem('recentTemplates');
    const savedFavorites = localStorage.getItem('favoriteTemplates');
    
    if (savedRecent) {
      setRecentTemplates(JSON.parse(savedRecent));
    }
    if (savedFavorites) {
      setFavoriteTemplates(JSON.parse(savedFavorites));
    }
  }, []);

  // Save to recent templates when a template is selected
  const addToRecentTemplates = (template) => {
    const updatedRecent = [
      template,
      ...recentTemplates.filter(t => t.id !== template.id)
    ].slice(0, 5); // Keep only 5 most recent
    
    setRecentTemplates(updatedRecent);
    localStorage.setItem('recentTemplates', JSON.stringify(updatedRecent));
  };

  // Toggle favorite template
  const toggleFavorite = (template) => {
    const isFavorite = favoriteTemplates.some(t => t.id === template.id);
    let updatedFavorites;
    
    if (isFavorite) {
      updatedFavorites = favoriteTemplates.filter(t => t.id !== template.id);
    } else {
      updatedFavorites = [template, ...favoriteTemplates];
    }
    
    setFavoriteTavorites(updatedFavorites);
    localStorage.setItem('favoriteTemplates', JSON.stringify(updatedFavorites));
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    const templateWithColor = {
      ...template,
      customColor: selectedColor,
      selectedAt: new Date().toISOString()
    };
    
    addToRecentTemplates(template);
    onSelectTemplate(templateWithColor);
    onClose();
  };

  // Handle template preview
  const handlePreview = (template) => {
    generatePreview(template, selectedColor, userData);
  };

  // Quick apply template (select without preview)
  const handleQuickApply = (template) => {
    handleTemplateSelect(template);
  };

  // Filter templates based on current view
  const getDisplayTemplates = () => {
    if (selectedCategory === 'recent') {
      return recentTemplates;
    } else if (selectedCategory === 'favorites') {
      return favoriteTemplates;
    }
    return templates;
  };

  const displayTemplates = getDisplayTemplates();

  // Get icon component by name
  const getIconComponent = (iconName) => {
    const icons = {
      Stethoscope: () => <span className="w-4 h-4">🩺</span>,
      Heart: () => <span className="w-4 h-4">❤️</span>,
      Baby: () => <span className="w-4 h-4">👶</span>,
      Brain: () => <span className="w-4 h-4">🧠</span>,
      Crown: () => <span className="w-4 h-4">👑</span>,
      Activity: () => <span className="w-4 h-4">💪</span>,
      Grid: () => <Grid size={16} />,
      Star: () => <Star size={16} />,
      Clock: () => <Clock size={16} />,
      Eye: () => <Eye size={16} />,
      Play: () => <Play size={16} />,
      Check: () => <Check size={16} />
    };
    
    return icons[iconName] || icons.Grid;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full h-full md:h-auto md:max-h-[95vh] overflow-hidden flex flex-col">
          
          {/* Modal Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Palette className="text-blue-600" size={24} md:size={28} />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-800">
                  Choose Your Template
                </h2>
                <p className="text-xs md:text-sm text-gray-600">
                  Select from {templates?.length} professional medical templates
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Color Picker */}
              <ColorPicker 
                selectedColor={selectedColor}
                onColorChange={handleColorChange}
                size="small"
                showLabel={false}
                showPresets={true}
                position="bottom-right"
              />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} md:size={24} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Filters & Search Bar */}
          <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50/80">
            <div className="flex flex-col lg:flex-row gap-3 md:gap-4 items-start lg:items-center">
              
              {/* Search Input */}
              <div className="flex-1 w-full lg:w-auto">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} md:size={20} />
                  <input
                    type="text"
                    placeholder="Search templates by name, description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {/* All Categories Button */}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Grid size={16} />
                  All Templates
                </button>

                {/* Recent Templates */}
                {recentTemplates.length > 0 && (
                  <button
                    onClick={() => setSelectedCategory('recent')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === 'recent' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Clock size={16} />
                    Recent
                  </button>
                )}

                {/* Favorite Templates */}
                {favoriteTemplates.length > 0 && (
                  <button
                    onClick={() => setSelectedCategory('favorites')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === 'favorites' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Star size={16} />
                    Favorites
                  </button>
                )}

                {/* Category Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <span className="hidden sm:inline">Categories</span>
                    <span className="sm:hidden">Cats</span>
                    <ChevronDown size={16} />
                  </button>

                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10 py-1">
                      {categories?.filter(cat => cat.value !== 'all')?.map(category => {
                          const IconComponent = getIconComponent(category.icon);
                          return (
                            <button
                              key={category.id}
                              onClick={() => {
                                setSelectedCategory(category.value);
                                setShowCategoryDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
                            >
                              <IconComponent />
                              <span>{category.name}</span>
                              <span className="text-xs text-gray-500 ml-auto">
                                ({category.count})
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="sortOrder">Default Order</option>
                    <option value="name">Name A-Z</option>
                    <option value="category">Category</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Template Grid */}
          <div className="flex-1 overflow-auto p-4 md:p-6">
            {loading ? (
              // Loading State
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading templates...</p>
                </div>
              </div>
            ) : displayTemplates.length === 0 ? (
              // Empty State
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No templates found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {selectedCategory === 'recent' 
                    ? "You haven't used any templates recently. Select a template to get started."
                    : selectedCategory === 'favorites'
                    ? "You don't have any favorite templates yet. Click the star icon to add templates to favorites."
                    : "No templates match your search criteria. Try adjusting your filters or search term."
                  }
                </p>
                {(selectedCategory === 'recent' || selectedCategory === 'favorites') && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse All Templates
                  </button>
                )}
              </div>
            ) : (
              // Templates Grid
              <>
                {/* Section Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {selectedCategory === 'recent' && 'Recently Used Templates'}
                      {selectedCategory === 'favorites' && 'Favorite Templates'}
                      {selectedCategory !== 'recent' && selectedCategory !== 'favorites' && 'Available Templates'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {displayTemplates.length} template{displayTemplates.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                  
                  {selectedCategory === 'recent' && recentTemplates.length > 0 && (
                    <button
                      onClick={() => {
                        setRecentTemplates([]);
                        localStorage.removeItem('recentTemplates');
                      }}
                      className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear Recent
                    </button>
                  )}
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {displayTemplates.map((template) => {
                    const isFavorite = favoriteTemplates.some(t => t.id === template.id);
                    const isRecent = recentTemplates.some(t => t.id === template.id);
                    const isSelected = selectedTemplate?.id === template.id;

                    return (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        isSelected={isSelected}
                        isFavorite={isFavorite}
                        isRecent={isRecent}
                        selectedColor={selectedColor}
                        onSelect={handleTemplateSelect}
                        onPreview={handlePreview}
                        onQuickApply={handleQuickApply}
                        onToggleFavorite={toggleFavorite}
                        userData={userData}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 md:p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600 w-full sm:w-auto">
              {selectedTemplate ? (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedColor }}
                  ></div>
                  <span>
                    Selected: <strong className="hidden sm:inline">{selectedTemplate.name}</strong>
                    <strong className="sm:hidden">{selectedTemplate?.name?.length > 20 ? selectedTemplate?.name?.substring(0, 20) + '...' : selectedTemplate?.name}</strong>
                  </span>
                </div>
              ) : (
                'No template selected'
              )}
            </div>
            
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedTemplate && handleTemplateSelect(selectedTemplate)}
                disabled={!selectedTemplate}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Apply Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewVisible && previewData && (
        <TemplatePreview
          previewData={previewData}
          isGenerating={isGenerating}
          onClose={closePreview}
          onUseTemplate={() => handleTemplateSelect(previewData.template)}
          onDownload={downloadPreview}
          selectedColor={selectedColor}
        />
      )}
    </>
  );
};

export default TemplateModal;