import mitt from 'mitt';

type AnyObject = Record<string, unknown>;

type Events = {
    [key: string]: { data: AnyObject | string };
};
export const bus = mitt<Events>();
