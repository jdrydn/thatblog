export namespace PostContentTypes {
  export interface Markdown {
    type: 'MARKDOWN';
    value: string;
  }

  export interface RichText {
    type: 'RICHTEXT';
    value: string;
  }

  export interface HTML {
    type: 'HTML';
    value: string;
  }

  export interface Media {
    type: 'MEDIA';
    media: Array<{
      href: string;
      alt?: string | undefined;
      caption?: string | undefined;
      source?: string | undefined;
    }>;
  }
}
