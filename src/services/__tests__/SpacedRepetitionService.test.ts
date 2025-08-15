import { SpacedRepetitionService } from '../SpacedRepetitionService';

describe('SpacedRepetitionService - Basic Structure', () => {
  let service: SpacedRepetitionService;

  beforeEach(() => {
    service = new SpacedRepetitionService();
  });

  it('should create SpacedRepetitionService instance', () => {
    expect(service).toBeInstanceOf(SpacedRepetitionService);
  });

  it('should have getByCardId method', () => {
    expect(typeof service.getByCardId).toBe('function');
  });

  it('should have create method', () => {
    expect(typeof service.create).toBe('function');
  });

  it('should have update method', () => {
    expect(typeof service.update).toBe('function');
  });

  it('should have delete method', () => {
    expect(typeof service.delete).toBe('function');
  });
});
