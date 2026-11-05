#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { createMyAnkiStacks } from '../lib/myanki';

createMyAnkiStacks(new App());
