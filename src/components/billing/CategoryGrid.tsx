import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Category } from '../../types';
import { CATEGORIES } from '../../config/menu';

interface CategoryGridProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = memo(({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      {CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id && styles.categoryButtonActive,
          ]}
          onPress={() => onSelectCategory(category.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a2e',
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#2a2a4a',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: '#3a3a5a',
    borderColor: '#FFD93D',
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8a8a9a',
  },
  categoryTextActive: {
    color: '#FFD93D',
  },
});

export default CategoryGrid;
