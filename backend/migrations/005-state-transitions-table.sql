-- State Transitions Table for Incident State Machine
-- T04-I01: Record state transitions with from, to, triggered_by, timestamp

CREATE TABLE IF NOT EXISTS state_transitions (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    from_state VARCHAR(50) NOT NULL,
    to_state VARCHAR(50) NOT NULL,
    triggered_by INTEGER NOT NULL REFERENCES users(id),
    reason TEXT,
    transitioned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for querying incident history
CREATE INDEX idx_state_transitions_incident ON state_transitions(incident_id);
CREATE INDEX idx_state_transitions_time ON state_transitions(transitioned_at DESC);

-- Add status_changed_at column to incidents if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'incidents' AND column_name = 'status_changed_at'
    ) THEN
        ALTER TABLE incidents ADD COLUMN status_changed_at TIMESTAMP;
    END IF;
END $$;

-- Add is_active column for archive functionality (T06-I04)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'incidents' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE incidents ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;