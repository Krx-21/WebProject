
import Link from 'next/link';
import Card from './Card';
import { RcpItem, RcpJson } from '../interface';

interface RcpCatalogProps {
    rcpJson: RcpJson;
}

export default async function RcpCatalog({ rcpJson }: RcpCatalogProps) {
    try {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rcpJson.data.map((venue: RcpItem) => (
                    <Link href={`/rcp/${venue._id}`} key={venue._id}>
                        <Card
                            venueName={venue.name}
                            imgSrc={venue.picture}
                        />
                    </Link>
                ))}
            </div>
        );
    } catch (err) {
        console.error(err);
        return (
            <div className="text-center p-8 text-red-500">
                Failed to load venues
            </div>
        );
    }
}