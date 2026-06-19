import { apiHandler } from '@/utils/apiHandler';

const CATALOGUE_BASE_URL = process.env.CATALOGUE_BASE_URL || 'http://localhost:7002';

export const GET = apiHandler({
  url: (req) => {
    // Extract categoryId from the URL path
    const urlParts = req.url.split('/');
    const subcategoriesIndex = urlParts.indexOf('subcategories');
    const categoryId = urlParts[subcategoriesIndex - 1];
    return `${CATALOGUE_BASE_URL}/api/catalogue/subcategories/${categoryId}`;
  },
  routeLabel: '/api/categories/[categoryId]/subcategories',
  errorMessage: 'Failed to fetch subcategories',
});
