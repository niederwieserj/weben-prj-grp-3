<?php
/**
 * Address Model
 * Represents the address data structure only.
 */
class Address {
    private int $addressId;
    private int $fkUserId;
    private string $postalCode;
    private string $address;
    private string $city;
    private string $country;
    private string $createdAt;

    public function __construct(array $data) {
        $this->addressId = (int)($data['address_id'] ?? 0);
        $this->fkUserId = (int)($data['fk_user_id'] ?? 0);
        $this->postalCode = $data['zip'] ?? '';
        $this->address = $data['address'] ?? '';
        $this->city = $data['city'] ?? '';
        $this->country = $data['country'] ?? '';
        $this->createdAt = $data['created_at'] ?? '';
    }

    // Getters
    public function getAddressId(): int { return $this->addressId; }
    public function getFkUserId(): int { return $this->fkUserId; }
    public function getPostalCode(): string { return $this->postalCode; }
    public function getAddress(): string { return $this->address; }
    public function getCity(): string { return $this->city; }
    public function getCountry(): string { return $this->country; }
    public function getCreatedAt(): string { return $this->createdAt; }

    // Setters
    public function setAddressId(int $addressId): void { $this->addressId = $addressId; }
    public function setFkUserId(int $fkUserId): void { $this->fkUserId = $fkUserId; }
    public function setPostalCode(string $postalCode): void { $this->postalCode = $postalCode; }
    public function setAddress(string $address): void { $this->address = $address; }
    public function setCity(string $city): void { $this->city = $city; }
    public function setCountry(string $country): void { $this->country = $country; }
    public function setCreatedAt(string $createdAt): void { $this->createdAt = $createdAt; }

    // Array representation
    public function toArray(): array {
        return [
            'address_id'  => $this->addressId,
            'fk_user_id'  => $this->fkUserId,
            'postal_code' => $this->postalCode,
            'address'     => $this->address,
            'city'        => $this->city,
            'country'     => $this->country,
            'created_at'  => $this->createdAt
        ];
    }
}
