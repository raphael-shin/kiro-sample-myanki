import { useDeckStore, setDeckService } from '../DeckStore';
import { DeckService } from '../../services/DeckService';

describe('DeckStore - Service Integration', () => {
  let mockDeckService: jest.Mocked<DeckService>;

  beforeEach(() => {
    useDeckStore.getState().reset?.();
    
    // Create mock DeckService
    mockDeckService = {
      getAll: jest.fn(),
      create: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getDeckWithStats: jest.fn(),
      searchDecks: jest.fn()
    } as any;
    
    // Inject mock service
    setDeckService(mockDeckService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset to null to use default service
    setDeckService(null as any);
  });

  it('should call DeckService.getAll when loadDecks is called', async () => {
    const mockDecks = [
      { id: 1, name: 'Test Deck 1', description: 'Description 1' },
      { id: 2, name: 'Test Deck 2', description: 'Description 2' }
    ];
    
    mockDeckService.getAll.mockResolvedValue(mockDecks as any);
    
    const { loadDecks } = useDeckStore.getState();
    await loadDecks();
    
    expect(mockDeckService.getAll).toHaveBeenCalledTimes(1);
    expect(useDeckStore.getState().decks).toEqual(mockDecks);
  });

  it('should call DeckService.create when createDeck is called', async () => {
    const newDeckData = { name: 'New Deck', description: 'New Description' };
    const createdDeck = { id: 1, ...newDeckData, createdAt: new Date(), updatedAt: new Date() };
    
    mockDeckService.create.mockResolvedValue(1);
    mockDeckService.getById.mockResolvedValue(createdDeck as any);
    
    const { createDeck } = useDeckStore.getState();
    await createDeck(newDeckData);
    
    expect(mockDeckService.create).toHaveBeenCalledWith(newDeckData);
    expect(mockDeckService.getById).toHaveBeenCalledWith(1);
  });

  it('should call DeckService.update when updateDeck is called', async () => {
    const updates = { name: 'Updated Name' };
    const updatedDeck = { id: 1, name: 'Updated Name', description: 'Description' };
    
    mockDeckService.update.mockResolvedValue();
    mockDeckService.getById.mockResolvedValue(updatedDeck as any);
    
    const { updateDeck } = useDeckStore.getState();
    await updateDeck(1, updates);
    
    expect(mockDeckService.update).toHaveBeenCalledWith(1, updates);
    expect(mockDeckService.getById).toHaveBeenCalledWith(1);
  });

  it('should call DeckService.delete when deleteDeck is called', async () => {
    mockDeckService.delete.mockResolvedValue();
    
    const { deleteDeck } = useDeckStore.getState();
    await deleteDeck(1);
    
    expect(mockDeckService.delete).toHaveBeenCalledWith(1);
  });
});
