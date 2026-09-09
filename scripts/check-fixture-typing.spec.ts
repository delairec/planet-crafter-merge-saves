import {describe, expect, it} from 'bun:test';
import {FixtureTypingViolation, findFixtureTypingViolations} from './check-fixture-typing.ts';

const PARTIAL_FIXTURE_REASON = 'a test fixture is fully typed: build it with its builder rather than assert the type away';
const TS_IGNORE_REASON = 'an illegal input is declared with @ts-expect-error, which fails when the error disappears';
const UNJUSTIFIED_DIRECTIVE_REASON = 'a @ts-expect-error directive says which invalidity is under test';

describe('findFixtureTypingViolations', () => {

  describe('When a fixture is completed with an unknown assertion', () => {
    it('should report the line, its text and what the rule asks for', () => {
      // Arrange
      const source = 'const input = {planets: undefined as unknown as []};';

      // Act
      const violations = findFixtureTypingViolations(source);

      // Assert
      expect<FixtureTypingViolation[]>(violations).toEqual([{
        line: 1,
        text: 'const input = {planets: undefined as unknown as []};',
        reason: PARTIAL_FIXTURE_REASON
      }]);
    });
  });

  describe('When a fixture is completed with a never assertion', () => {
    it('should report the line', () => {
      // Arrange
      const source = 'const players = [] as never;';

      // Act
      const violations = findFixtureTypingViolations(source);

      // Assert
      expect<FixtureTypingViolation[]>(violations).toEqual([{
        line: 1,
        text: 'const players = [] as never;',
        reason: PARTIAL_FIXTURE_REASON
      }]);
    });
  });

  describe('When a value is annotated with the any type', () => {
    it('should report the line', () => {
      // Arrange
      const source = 'const player: any = {id: 1};';

      // Act
      const violations = findFixtureTypingViolations(source);

      // Assert
      expect<FixtureTypingViolation[]>(violations).toEqual([{
        line: 1,
        text: 'const player: any = {id: 1};',
        reason: PARTIAL_FIXTURE_REASON
      }]);
    });
  });

  describe('When a JSDoc tag annotates a value with the any type', () => {
    it('should report the line a plain type annotation search cannot see', () => {
      // Arrange
      const source = 'const player = /** @type {any} */ ({id: 1, name: \'Nikowa\'});';

      // Act
      const violations = findFixtureTypingViolations(source);

      // Assert
      expect(violations.map(violation => violation.line)).toEqual([1]);
    });
  });

  describe('When an illegal input is silenced with a ts-ignore directive', () => {
    it('should report the line and name the directive that fails when the error disappears', () => {
      // Arrange
      const source = '// @ts-ignore invalid section';

      // Act
      const violations = findFixtureTypingViolations(source);

      // Assert
      expect<FixtureTypingViolation[]>(violations).toEqual([{
        line: 1,
        text: '// @ts-ignore invalid section',
        reason: TS_IGNORE_REASON
      }]);
    });
  });

  describe('When a ts-expect-error directive carries no justification', () => {
    it('should report the line', () => {
      // Arrange
      const source = '// @ts-expect-error';

      // Act
      const violations = findFixtureTypingViolations(source);

      // Assert
      expect<FixtureTypingViolation[]>(violations).toEqual([{
        line: 1,
        text: '// @ts-expect-error',
        reason: UNJUSTIFIED_DIRECTIVE_REASON
      }]);
    });
  });

  describe('When a ts-expect-error directive names the invalidity under test', () => {
    it('should report nothing', () => {
      // Arrange
      const source = '// @ts-expect-error a missing planets array is the invalid data under test';

      // Act
      const violations = findFixtureTypingViolations(source);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When a forbidden form is written inside a string literal', () => {
    it('should report nothing', () => {
      // Arrange
      const source = 'expect(rejection).toBe(\'rejected as unknown value\');';

      // Act
      const violations = findFixtureTypingViolations(source);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When a name merely contains a forbidden token', () => {
    it('should report nothing', () => {
      // Arrange
      const source = 'const anyPlayerAtAll = createPlayer({});';

      // Act
      const violations = findFixtureTypingViolations(source);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When several lines break the rule', () => {
    it('should report each of them in file order', () => {
      // Arrange
      const source = [
        'const first = value as never;',
        'const second = createPlayer({id: 1});',
        'const third: any = value;'
      ].join('\n');

      // Act
      const violations = findFixtureTypingViolations(source);

      // Assert
      expect(violations.map(violation => violation.line)).toEqual([1, 3]);
    });
  });
});
