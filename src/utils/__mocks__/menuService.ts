export const mockFetchMenuData = jest.fn();
export const mockGetMenuForDate = jest.fn();

const mock = jest.fn().mockImplementation(() => {
  return {
    fetchMenuData: mockFetchMenuData,
    getMenuForDate: mockGetMenuForDate,
  };
});

export const MenuService = mock;
