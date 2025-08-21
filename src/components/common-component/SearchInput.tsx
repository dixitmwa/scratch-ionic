import React from 'react';
import './SearchInput.css';
import { IonIcon } from '@ionic/react';
import { search } from 'ionicons/icons';

const SearchInput = ({ value, onChange, onSearch }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onSearch: () => void }) => {
    return (
        <div className="search-container">
            <input
                type="text"
                className="search-input"
                placeholder="Search..."
                value={value}
                onChange={onChange}
            />
            <button
                className="search-btn"
                onClick={onSearch}
                aria-label="Search"
            >
                <IonIcon icon={search} />
            </button>
        </div>
    );
};

export default SearchInput;
