import type { EstimatorUnit } from './units';

export const CATEGORY_SITE_WORKS = 'Site / Preliminary Works';
export const CATEGORY_FOUNDATION = 'Foundation';
export const CATEGORY_STRUCTURAL = 'RCC / Structural Works';
export const CATEGORY_BRICKWORK = 'Brick / Block Work';
export const CATEGORY_PLASTERING = 'Plastering';
export const CATEGORY_FLOORING = 'Flooring';

export interface CivilInputDef {
  key: string;
  label: string;
  symbol: string;
}

export interface CivilWorkDef {
  key: string;
  label: string;
  category: string;
  inputs: CivilInputDef[];
  unit: EstimatorUnit;
  formulaLabel: string;
  calculate: (values: Record<string, number>) => number;
}

export function areaOf(length: number, width: number): number {
  return length * width;
}

export function volumeOf(length: number, width: number, depth: number): number {
  return length * width * depth;
}

export function perimeterOf(length: number, width: number): number {
  return 2 * (length + width);
}

const L: CivilInputDef = { key: 'length', label: 'Length', symbol: 'L' };
const W: CivilInputDef = { key: 'width', label: 'Width', symbol: 'W' };
const H: CivilInputDef = { key: 'height', label: 'Height', symbol: 'H' };
const D: CivilInputDef = { key: 'depth', label: 'Depth / Thickness', symbol: 'D' };

function volume(values: Record<string, number>): number {
  return volumeOf(values.length, values.width, values.depth);
}

function area(values: Record<string, number>): number {
  return areaOf(values.length, values.width);
}

function wallVolume(values: Record<string, number>): number {
  return volumeOf(values.length, values.height, values.depth);
}

function plasterArea(values: Record<string, number>): number {
  return areaOf(values.length, values.height);
}

export const CIVIL_WORKS: CivilWorkDef[] = [
  {
    key: 'concrete',
    label: 'Concrete',
    category: CATEGORY_STRUCTURAL,
    inputs: [L, W, D],
    unit: 'cum',
    formulaLabel: 'Length \u00d7 Width \u00d7 Depth / Thickness = Volume',
    calculate: volume,
  },
  {
    key: 'rcc',
    label: 'RCC (Reinforced Cement Concrete)',
    category: CATEGORY_STRUCTURAL,
    inputs: [L, W, D],
    unit: 'cum',
    formulaLabel: 'Length \u00d7 Width \u00d7 Depth / Thickness = Volume',
    calculate: volume,
  },
  {
    key: 'pcc',
    label: 'PCC (Plain Cement Concrete)',
    category: CATEGORY_FOUNDATION,
    inputs: [L, W, D],
    unit: 'cum',
    formulaLabel: 'Length \u00d7 Width \u00d7 Depth / Thickness = Volume',
    calculate: volume,
  },
  {
    key: 'brickwork',
    label: 'Brickwork',
    category: CATEGORY_BRICKWORK,
    inputs: [L, H, D],
    unit: 'cum',
    formulaLabel: 'Length \u00d7 Height \u00d7 Thickness = Volume',
    calculate: wallVolume,
  },
  {
    key: 'blockwork',
    label: 'Blockwork',
    category: CATEGORY_BRICKWORK,
    inputs: [L, H, D],
    unit: 'cum',
    formulaLabel: 'Length \u00d7 Height \u00d7 Thickness = Volume',
    calculate: wallVolume,
  },
  {
    key: 'plastering',
    label: 'Plastering',
    category: CATEGORY_PLASTERING,
    inputs: [L, H],
    unit: 'sqm',
    formulaLabel: 'Length \u00d7 Height = Surface Area',
    calculate: plasterArea,
  },
  {
    key: 'flooring',
    label: 'Flooring',
    category: CATEGORY_FLOORING,
    inputs: [L, W],
    unit: 'sqm',
    formulaLabel: 'Length \u00d7 Width = Floor Area',
    calculate: area,
  },
  {
    key: 'excavation',
    label: 'Excavation',
    category: CATEGORY_SITE_WORKS,
    inputs: [L, W, D],
    unit: 'cum',
    formulaLabel: 'Length \u00d7 Width \u00d7 Depth = Volume',
    calculate: volume,
  },
];

export function findCivilWork(key: string): CivilWorkDef | undefined {
  return CIVIL_WORKS.find((work) => work.key === key);
}

export function calculateCivilQuantity(
  work: CivilWorkDef,
  values: Record<string, number>
): number {
  return work.calculate(values);
}