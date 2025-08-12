import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class LunchMenuApi implements ICredentialType {
  name = 'lunchMenuApi';
  displayName = 'LC Lunch Menu API';
  documentationUrl = 'https://example.com/docs';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.lclunchmenu.com/v1',
      required: true,
    },
  ];
}
