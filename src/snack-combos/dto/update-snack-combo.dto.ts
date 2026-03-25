import { PartialType } from '@nestjs/mapped-types';
import { CreateSnackComboDto } from './create-snack-combo.dto';

export class UpdateSnackComboDto extends PartialType(CreateSnackComboDto) {}
