import React from "react";
import {
  Eye,
  Check,
  Star,
  Clock,
  Play,
  Stethoscope,
  Heart,
  Baby,
  Brain,
  Crown,
  Sparkles,
  Shield,
  Activity,
  Book,
  FileText,
  Minimize,
} from "lucide-react";

const TemplateCard = ({
  template,
  isSelected,
  isFavorite,
  isRecent,
  onSelect,
  onPreview,
  onQuickApply,
  onToggleFavorite,
  selectedColor,
  userData,
}) => {
  // Function to get the appropriate icon component
  const getIconComponent = (iconName) => {
    const iconMap = {
      Stethoscope: Stethoscope,
      Heart: Heart,
      Baby: Baby,
      Brain: Brain,
      Crown: Crown,
      Sparkles: Sparkles,
      Shield: Shield,
      Activity: Activity,
      Book: Book,
    //   Tooth: Tooth,
      Minimize: Minimize,
    };

    const IconComponent = iconMap[iconName] || FileText;
    return <IconComponent size={18} className="text-gray-600" />;
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(template);
  };

  const handleQuickApplyClick = (e) => {
    e.stopPropagation();
    onQuickApply(template);
  };

  const handlePreviewClick = (e) => {
    e.stopPropagation();
    onPreview(template);
  };

  return (
    <div
      className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 group ${
        isSelected ? "ring-4 ring-blue-500 ring-offset-2" : "hover:shadow-xl"
      }`}
      onClick={() => onSelect(template)}
    >
      {/* Template Preview Card */}
      <div
        className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
        style={{ backgroundColor: template.bgColor }}
      >
        {/* Card Header with Color Bar */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: selectedColor }}
        ></div>

        {/* Mini Template Preview */}
        <div className="p-3 sm:p-4">
          {/* Template Header Preview */}
          <div
            className="h-16 flex flex-col justify-center p-3 rounded-lg mb-3 text-white"
            style={{ backgroundColor: selectedColor }}
          >
            <div className="text-white text-xs font-bold text-center">
              <div className="text-sm truncate">
                {userData?.hospitalName || "Your Hospital"}
              </div>
              <div className="text-xs opacity-90 truncate">
                {userData?.hospitalSubtitle || "Medical Center"}
              </div>
            </div>
          </div>

          {/* Template Content */}
          <div className="space-y-3">
            {/* Template Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getIconComponent(template.iconName)}
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm leading-tight">
                  {template.name}
                </h3>
              </div>

              {/* Favorite Button */}
              <button
                onClick={handleFavoriteClick}
                className="p-1 hover:bg-yellow-50 rounded-full transition-colors"
              >
                <Star
                  size={16}
                  className={
                    isFavorite
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-400"
                  }
                />
              </button>
            </div>

            <p className="text-xs text-gray-600 line-clamp-2">
              {template.description}
            </p>

            {/* Template Features */}
            <div className="flex flex-wrap gap-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                {template.layoutName}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                {template.category}
              </span>
              {isRecent && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  <Clock size={10} className="mr-1" />
                  Recent
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer with Actions */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              {/* Preview Button */}
              <button
                onClick={handlePreviewClick}
                className="p-1 sm:p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Preview template"
              >
                <Eye size={14} sm:size={16} />
              </button>

              {/* Quick Apply Button */}
              <button
                onClick={handleQuickApplyClick}
                className="p-1 sm:p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Quick apply template"
              >
                <Play size={14} sm:size={16} />
              </button>
            </div>

            {/* Selection Indicator */}
            {isSelected && (
              <div className="flex items-center gap-1 text-green-600 text-xs sm:text-sm">
                <Check size={14} sm:size={16} />
                <span className="font-medium hidden sm:inline">Selected</span>
                <span className="font-medium sm:hidden">✓</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 rounded-xl pointer-events-none border-2 border-transparent group-hover:border-blue-400 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
    </div>
  );
};

export default TemplateCard;
